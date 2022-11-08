#!/usr/bin/python
# Copyright: (c) 2022, Agilicus

from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

DOCUMENTATION = r'''

 Sample Customer Creator

   - creates a sub organisation for the customer based on input name
   - creates connectors
   - creates network services
   - creates forwarders
---
module: agilicus

'''

EXAMPLES = r'''
'''

RETURN = r'''
'''

from ansible.module_utils.basic import AnsibleModule
import agilicus
import yaml
import os


def load_yaml(auth_doc):
    with open(auth_doc, "r") as stream:
        return yaml.safe_load(stream)


def run_module():
    # define available arguments/parameters a user can pass to the module
    module_args = dict(
        auth_doc=dict(type='str', required=True),
        name=dict(type='str', required=True),
        customer_config=dict(type='str', required=True),
    )

    # seed the result dict in the object
    # we primarily care about changed and state
    # changed is if this module effectively modified the target
    # state will include any data that you want your module to pass back
    # for consumption, for example, in a subsequent task
    result = dict(
        changed=False,
        original_message='',
        message=''
    )

    # the AnsibleModule object will be our abstraction working with Ansible
    # this includes instantiation, a couple of common attr would be the
    # args/params passed to the execution, as well as if the module
    # supports check mode
    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True
    )

    # if the user is working with this module in only check mode we do not
    # want to make any changes to the environment, just return the current
    # state with no modifications
    if module.check_mode:
        module.exit_json(**result)

    name = module.params['name']
    auth_doc = module.params['auth_doc']

    config = load_yaml(module.params['customer_config'])

    auth_doc_obj = load_yaml(auth_doc)
    issuer = auth_doc_obj["spec"]["auth_issuer_url"]
    parent_org_id = auth_doc_obj["spec"]["org_id"]
    scopes = agilicus.scopes.DEFAULT_SCOPES_MULTI
    api_url=os.getenv("AGILICUS_API_SERVER", "https://api.agilicus.com")
    cacert=os.getenv("SSL_CERT_FILE", None)
    api = agilicus.GetClient(
        agilicus_scopes=scopes,
        issuer=issuer,
        authentication_document=auth_doc,
        api_url=api_url,
        cacert=cacert,
    )

    parent = api.organisations.get_org(parent_org_id)

    suborg = agilicus.Organisation(
        organisation=name,
        subdomain=f"{name}.{parent['subdomain']}",
    )
    result = agilicus.create_or_update(
        suborg,
        lambda obj : api.organisations.create_sub_org(parent_org_id, obj),
    )

    sub_org_result = result[0]

    final = {}
    final["organisation"] = sub_org_result
    final["connectors"] = []
    final["networks"] = []
    final["forwarders"] = []

    connector_map = {}
    networks_map = {}
    for connector_config in config.get("connectors", []):
        spec = agilicus.AgentConnectorSpec(org_id=sub_org_result["id"], name=connector_config["name"])
        connector = agilicus.AgentConnector(spec=spec)
        result = agilicus.create_or_update(
            connector,
            lambda obj: api.connectors.create_agent_connector(obj),
            lambda guid, obj: api.connectors.replace_agent_connector(guid, agent_connector=obj),
        )
        final["connectors"].append(result[0])
        connector_map[connector_config["name"]] = result[0]


    for network in config.get("networks", []):
        kwargs = {}
        if network.get("ipv4_address"):
            kwargs["ipv4_addresses"] = network.get("ipv4_address")
        connector_name = network.get("connector")
        if connector_name:
            connector = connector_map.get(connector_name)
            kwargs["connector_id"] = connector["metadata"]["id"]

        service = agilicus.ApplicationService(
            name=network["name"],
            org_id=sub_org_result["id"],
            hostname=network["hostname"],
            port=network["port"],
            **kwargs,
        )
        result = agilicus.create_or_update(
            service,
            lambda obj: api.application_services.create_application_service(obj),
            lambda guid, obj: api.application_services.replace_application_service(guid, application_service=obj),
        )
        final["networks"].append(result[0])
        networks_map[network["name"]] = result[0]

    for forwarder in config.get("forwarders", []):
        connector_name = forwarder["connector"]
        connector = connector_map.get(connector_name)

        network = networks_map[forwarder["network"]]
        bind_address = forwarder.get("bind_address")
        kwargs = {}
        if bind_address:
            kwargs["bind_address"] = forwarder.get("bind_address")

        spec = agilicus.ServiceForwarderSpec(
            org_id=sub_org_result["id"],
            name=forwarder["name"],
            port=forwarder["port"],
            connector_id=connector["metadata"]["id"],
            application_service_id=network["id"],
            **kwargs,
        )
        forwarder = agilicus.ServiceForwarder(spec=spec)
        result = agilicus.create_or_update(
            forwarder,
            lambda obj: api.application_services.create_service_forwarder(obj),
            lambda guid, obj: api.application_services.replace_service_forwarder(guid, service_forwarder=obj),
        )
        final["forwarders"].append(result[0])

    # in the event of a successful module execution, you will want to
    # simple AnsibleModule.exit_json(), passing the key/value results
    module.exit_json(**final)


def main():
    run_module()


if __name__ == '__main__':
    main()
