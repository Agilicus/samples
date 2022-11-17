# Ansible Sample for Suborg workflow

This sample will setup a 'customer', which will be instantiated inside its own sub-organisation.

The purpose is to demonstrate via automation, connecting networks between between sites over Agilicus cloud.
This provides a network authorization mechansim without a VPN.

## Organisation of configuration

### inventory.yaml

Provides the inventory for where connectors and forwarders are installed (ie. hosts).

Two groups are defined, 'cloud' and 'onprem'.  Connectors are installed in each host for those groups, and then
forwarders are setup from cloud -> onprem and onprem -> cloud, based on the playbook configuration.

### example.yaml

The playbook invokes the following:

1. Python dependencies are installed on the ansible host, defined in inventory.
2. The suborg is created, also called customer in this sample.
3. Connectors are created for each host in the onprem and cloud groups. Networks are configured for each group, which tell the builder what networks will be created on that connector host.
4. Forwarders are created between cloud -> onprem, and onprem -> cloud.
5. Connectors are installed on all hosts in onprem and cloud groups.

## Authentication for automation

An authentication document is required, with the approriate permissions. This can be created as follows:

1.  First Create a service account. This can be achieved in the admin portal. 
    Give the service account admin access permission by adding the service account name
    to the 'sys-admin' group name.
    
2.  Now via agilicus-cli, list the service accounts
	```
	agilicus-cli --issuer https://auth.<org domain> list-service-accounts
	```
    find the service account created in step 1, note the
    user 'id' for the service account.  Note that this is not the id of the service account,
    but rather the 'User' id that is associated with the service account.
    
3.  Create an authentication document for the service account:
	```
	agilicus-cli --issuer https://auth.<org domain> add-authentication-document --user-id <user_id_from_step_2> --auth-issuer-url https://auth.<org domain> --outfile authdoc.json
	```

4. Encrypt the authdoc.json into ansible-vault:
	```
	ansible-vault encrypt authdoc.json
	```


## Example

```
ansible-playbook -i inventory.yaml example.yaml --vault-id @prompt -e customer_name=customer-mytest
```
