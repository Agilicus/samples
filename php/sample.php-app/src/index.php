<?php
session_start();

$client_id = 'sample-php-app';
$client_secret = 'NOTREALLYSECRET';
$redirect_uri = url_origin($_SERVER);
$metadata_url = 'https://auth.cloud.egov.city/.well-known/openid-configuration';


if(isset($_GET['logout'])) {
  unset($_SESSION['username']);
  unset($_SESSION['name']);
  unset($_SESSION['email']);
  unset($_SESSION['sub']);
  unset($_SESSION['role']);
  header('Location: /');
  die();
}

if(isset($_SESSION['sub'])) {
  echo '<p>Logged in as</p>';
  echo '<p> Name: ' . $_SESSION['name'] . '</p>';
  echo '<p> Username: ' . $_SESSION['username'] . '</p>';
  echo '<p> Email: ' . $_SESSION['email'] . '</p>';
  echo '<p> SUB: ' . $_SESSION['sub'] . '</p>';
  echo '<p> Role: ' . $_SESSION['role'] . '</p>';
  echo '<p><a href="/?logout">Log Out</a></p>';
  die();
}

$metadata = http($metadata_url);

if(!isset($_GET['code'])) {

  $_SESSION['state'] = bin2hex(random_bytes(5));
  $_SESSION['code_verifier'] = bin2hex(random_bytes(50));
  $code_challenge = base64_urlencode(hash('sha256', $_SESSION['code_verifier'], true));

  $authorize_url = $metadata->authorization_endpoint.'?'.http_build_query([
    'response_type' => 'code',
    'client_id' => $client_id,
    'redirect_uri' => $redirect_uri,
    'state' => $_SESSION['state'],
    'scope' => 'openid email profile',
    'code_challenge' => $code_challenge,
    'code_challenge_method' => 'S256',
  ]);

  echo '<p>Not logged in</p>';
  echo '<p><a href="'.$authorize_url.'">Log In</a></p>';

} else {

  if($_SESSION['state'] != $_GET['state']) {
    die('Authorization server returned an invalid state parameter');
  }

  if(isset($_GET['error'])) {
    die('Authorization server returned an error: '.htmlspecialchars($_GET['error']));
  }

  $response = http($metadata->token_endpoint, [
    'grant_type' => 'authorization_code',
    'code' => $_GET['code'],
    'redirect_uri' => $redirect_uri,
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'code_verifier' => $_SESSION['code_verifier'],
  ]);

  if(!isset($response->access_token)) {
    die('Error fetching access token');
  }

  # NOTE: __HOST-access-token is implicitly a secure cookie and
  # won't be issued on http (only https). You may need to change
  # it for development.
  # NOTE: you may set a cookie and/or set a header 'Authorization: Bearer Access-Token'
  # on each request. Both work.
  setcookie("__Host-access-token", $response->access_token);

  $userinfo = http($metadata->userinfo_endpoint, [
    'access_token' => $response->access_token,
  ], array('Authorization: Bearer ' . $response->access_token) );

  if($userinfo->sub) {
    $_SESSION['sub'] = $userinfo->sub;
    $_SESSION['name'] = $userinfo->name;
    $_SESSION['username'] = $userinfo->preferred_username;
    $_SESSION['email'] = $userinfo->email;
    $_SESSION['profile'] = $userinfo;
    $_SESSION['role'] = $userinfo->agilicus->roles->{"sample-php-app"}[0];
    header('Location: /');
    die();
  }
}

// Base64-urlencoding is a simple variation on base64-encoding
// Instead of +/ we use -_, and the trailing = are removed.
function base64_urlencode($string) {
  return rtrim(strtr(base64_encode($string), '+/', '-_'), '=');
}

function http($url, $params=false, $headers=false) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  if($params)
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
  if($headers)
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  return json_decode(curl_exec($ch));
}

function url_origin( $s )
{
    $ssl      = ( ! empty( $s['HTTPS'] ) && $s['HTTPS'] == 'on' );
    $sp       = strtolower( $s['SERVER_PROTOCOL'] );
    $protocol = substr( $sp, 0, strpos( $sp, '/' ) ) . ( ( $ssl ) ? 's' : '' );
    $port     = $s['SERVER_PORT'];
    $port     = ( ( ! $ssl && $port=='80' ) || ( $ssl && $port=='443' ) ) ? '' : ':'.$port;
    $host     = isset( $s['HTTP_HOST'] ) ? $s['HTTP_HOST'] : null;
    $host     = isset( $host ) ? $host : $s['SERVER_NAME'] . $port;
    return $protocol . '://' . $host . '/';
}
