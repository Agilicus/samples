# Ansible Sample for Suborg workflow

This sample will setup a 'customer', which is defined as a sub-organisation.

This playbook will read a customer configuration yaml file, and create, as part of that suborganisation:
  - connectors
  - networks
  - forwarders


The intention is to demonstrate how to utilize the Agilicus SDK to build out certain workflows.

## Example

```
ansible-playbook example.yaml -e auth_doc=$PWD/authdoc.yaml -e customer_name=customer-mytest -e customer_config=$PWD/customer_config.yaml ```
