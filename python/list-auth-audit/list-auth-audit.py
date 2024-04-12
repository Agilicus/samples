"""
Sample: list-auth-audit

Find all users.
Intersect with a specific granted application permission.
Find all authentication audits for that user for that application.

Accept either a real-person signing in (will open a browser and complete
an OpenID-Connect Flow), or, an AuthDoc (e.g. a service account) for
headless or unattended operation.

A normal authentication flow for a user might look like (for a single sign-in):
    2024-04-12 18:21:16.669000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - Success - Success - Authentication Request
    2024-04-12 18:21:16.635000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - Create - Create - Token
    2024-04-12 18:21:15.452000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - CodeIssued - CodeIssued - Authentication Request
    2024-04-12 18:21:14.541000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - Success - Success - MFA Challenge
    2024-04-12 18:20:24.361000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - InProgress - InProgress - MFA Challenge
    2024-04-12 18:20:24.264000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - Create - Create - Token
    2024-04-12 18:20:23.679000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - Success - Success - Policy Evaluation
    2024-04-12 18:20:23.667000+00:00 - profile - XGMKWs5Sqh3wBoKkTPMTRf - DoMfa - DoMfa - Policy Evaluation
    2024-04-12 18:20:23.309000+00:00 - profile -  - Success - Success - Identity Provider Callback
    2024-04-12 18:20:18.691000+00:00 - profile -  - Success - Success - Identity Provider Authentication
    2024-04-12 18:20:18.682000+00:00 - profile -  - InProgress - InProgress - Identity Provider Authentication
    2024-04-12 18:20:17.219000+00:00 - profile -  - Authenticate - Authenticate - Policy Evaluation
    2024-04-12 18:20:17.160000+00:00 - profile -  - InProgress - InProgress - Authentication Request
"""

import agilicus
import agilicus_api
import argparse
import sys
import datetime
import dateparser
from dateutil.tz import tzutc

scopes = agilicus.scopes.DEFAULT_SCOPES

parser = argparse.ArgumentParser(description="update-user")
parser.add_argument("--auth-doc", type=str)
parser.add_argument("--issuer", type=str)
parser.add_argument("--start-time", type=str, default='2024-01-01')
args = parser.parse_args()

if not args.auth_doc and not args.issuer:
    print("error: specify either an --auth-doc or --issuer", file=sys.stderr)
    sys.exit(1)

api = agilicus.GetClient(
    agilicus_scopes=scopes, issuer=args.issuer, authentication_document=args.auth_doc
)


def api_retry(method, **kwargs):
    try:
        return method(**kwargs)
    except agilicus_api.exceptions.UnauthorizedException:
        return method(**kwargs)


def get_all_auth_records(start_time="2024-01-01"):
    """Fetch all authentication audit records."""

    done = False
    auth = []
    plimit = 500
    ndone = 0

    user_app_access = {}

    applications = {
        'agilicus-builtin-cli': 0,
        'profile': 0,
        'agilicus-builtin-wscat': 0,
        'agilicus-builtin-portal': 0
    }

    etime = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%d %H:%M:%S")

    while done is False:
        print(f"FETCH authentication audits from {start_time} - {etime} ({ndone} complete)", file=sys.stderr)
        auth_audits = api_retry(api.audits.list_auth_records,
                                org_id=api.default_org_id,
                                dt_from=start_time,
                                dt_to=etime,
                                limit=plimit)
        auth.extend(auth_audits.auth_audits)
        done = True
        if len(auth_audits.auth_audits) > 0:
            for audit in auth_audits.auth_audits:
                applications[audit.client_id] = True
                # Only look at successful
                if audit.event == 'Success' and audit.result == 'Success' and audit.stage in ['Authentication Request', 'Refresh']:
                    #print(f"{audit.time} - {audit.client_id} - {audit.user_id} - {audit.event} - {audit.result} - {audit.stage}")

                    if audit.user_id not in user_app_access:
                        user_app_access[audit.user_id] = {}
                    if audit.client_id not in user_app_access[audit.user_id]:
                        user_app_access[audit.user_id][audit.client_id] = 0

                    user_app_access[audit.user_id][audit.client_id] += 1

                    ndone = ndone + 1
                    etime_tz = dateparser.parse(etime, settings={"TIMEZONE": "UTC", "TO_TIMEZONE": "UTC"}).replace(tzinfo=tzutc())
                    if audit.time < etime_tz:
                        done = False
                        etime = audit.time.strftime("%Y-%m-%d %H:%M:%S")
    return auth, user_app_access, applications


def get_all_users():
    """Get all users, regardless of current state (enabled/disabled).
       Handle pagination.
       See https://www.agilicus.com/api/#tag--Users """

    done = False
    users = []
    permissions = {}
    plimit = 500
    previous_email = ""

    while done is False:
        print(f"FETCH users from page-key {previous_email}", file=sys.stderr)
        result_users = api_retry(method=api.users.list_users,
                                 org_id=api.default_org_id,
                                 limit=plimit,
                                 previous_email=previous_email)

        previous_email = str(result_users.next_page_email)
        for user in result_users.users:
            if user.type == 'service_account' or user.type == 'group' or user.type == 'bigroup':
                continue
            print(f"FETCH roles/permissions for {user.email}", file=sys.stderr)
            roles = api_retry(method=api.users.list_all_user_roles, user_id=user.id, org_id=api.default_org_id)
            permissions[user.id] = [x for x in roles.to_dict() if 'urn:api' not in x]
            permissions[user.id].extend( ['agilicus-builtin-cli', 'profile', 'agilicus-builtin-wscat', 'agilicus-builtin-portal'] )

            users.append(user)
        if len(result_users.users) == 0 or len(previous_email) == 0:
            done = True
            break

    print("", file=sys.stderr)
    return users, permissions

def dump_results(applications, users, permissions, auth_audits, user_app_access):
    app_names = ', '.join(list(sorted(applications.keys())))

    print(f"User-ID, User-Email, {app_names}")

    blank_app_list = {}
    for app_name in applications.keys():
        blank_app_list[app_name] = '-'

    for user in users:
        plist = blank_app_list.copy()
        perm = permissions[user.id]
        if user.id in user_app_access:
            for app_name in perm:
                if app_name in user_app_access[user.id]:
                    plist[app_name] = user_app_access[user.id][app_name]

        plist_val = []
        for app_name in list(sorted(plist.keys())):
            plist_val.append(plist[app_name])
        plist_str = ', '.join(map(str, plist_val))
        print(f"{user.id}, {user.email}, {plist_str}")


auth_audits, user_app_access, applications = get_all_auth_records(start_time=args.start_time)
users, permissions = get_all_users()
dump_results(applications, users, permissions, auth_audits, user_app_access)


