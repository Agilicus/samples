# Ansible Sample for Suborg workflow

This sample will setup a 'customer', which is defined as a sub-organisation.

This playbook will read a customer configuration yaml file, and create, as part of that suborganisation:
  - connectors
  - networks
  - forwarders


The intention is to demonstrate how to utilize the Agilicus SDK to build out certain workflows.

## Requirements

An authentication document is required, with the approriate permissions. This can be created as follows:

1.  First Create a service account. This can be achieved in the admin portal. 
    Give the service account admin access permission by adding the service account name
    to the 'sys-admin' group name.
    
2.  Now via agilicus-cli, list the service accounts
	```
	agilicus-cli --issuer <> list-service-accounts
	```
    find the service account created in step 1, note the
    user 'id' for the service account.  Note that this is not the id of the service account,
    but rather the 'User' id that is associated with the service account.
    
3.  Create an authentication document for the service account:
	```
	agilicus-cli --issuer <> add-authentication-document --user-id <user_id_from_step_2> --auth-issuer-url <issuer> --output authdoc.json
	```

4. Encrypt the authdoc.json into ansible-vault:
	```
	ansible-vault encrypt authdoc.json
	```


## Example

```
ansible-playbook example.yaml --vault-id @prompt -e customer_name=customer-mytest
```
