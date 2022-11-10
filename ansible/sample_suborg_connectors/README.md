# Ansible Sample for Suborg workflow

This sample will setup a 'customer', which will be instantiated inside its own sub-organisation.

The purpose is to demonstrate via automation, connecting networks between between sites over Agilicus cloud.
This provides a network authorization mechansim without a VPN.

## Organisation of configuration

### inventory.yaml

Provides the inventory for where connectors and forwarders are installed (ie. hosts). The forwarders have their
own vars, such that it provides the definition of how a forwarder (connector) should forward to a particular connector.
A forwarder also provides variables for bind_address and port_offset.

### example.yaml

The playbook goes through 3 stages.

The first stage creates the 'customer'. This operates on the localhost, since it communicates with the Agilicus cloud
via the Agilicus SDK.

The second stage creates all connectors.  Variables provided for the connectors define what networks should be created and
bound to the connector. Note this creates both the connector object in Agilicus, as well as installs the connector on the remote
machine.

The third stage creates forwarders, and which connector should be forwarded. The forwarder will read the connector to forward
to and will forward all networks that are bound on that connector. The port_offset parameter provided by the inventory provides
what port offset should be applied on the local forwarder with respect to the destination network.

## Authentication for automation

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
ansible-playbook -i inventory.yaml example.yaml --vault-id @prompt -e customer_name=customer-mytest
```
