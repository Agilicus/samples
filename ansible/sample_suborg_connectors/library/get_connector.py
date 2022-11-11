#!/usr/bin/python
# Copyright: (c) 2022, Agilicus

from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

DOCUMENTATION = r'''

 Get an existing Connector

---
module: get_connector 

'''

EXAMPLES = r'''
'''

RETURN = r'''
'''

from ansible.module_utils.basic import AnsibleModule
import agilicus
import yaml
import os
import json


def load_yaml(auth_doc):
    with open(auth_doc, "r") as stream:
        return yaml.safe_load(stream)


def get_org(api, parent_org_id, org_name):
    result = api.organisations.list_orgs(
        org_id=parent_org_id,
        list_children=True,
    )
    for org in result.orgs:
        if org.get("organisation") == org_name:
            return org
    return None


def get_connector(api, org_id, connector_name):
    result = api.connectors.list_connector(
        org_id=org_id,
        name=connector_name,
    )
    if len(result["connectors"]) != 1:
        return None
    return result["connectors"][0]


def run_module():
    # define available arguments/parameters a user can pass to the module
    module_args = dict(
        auth_doc=dict(type='str', required=True),
        customer=dict(type='str', required=True),
        connector_name=dict(type='str', required=True),
        networks=dict(type='str', required=False),
        forwarding_connectors=dict(type='str', required=False),
        forwarder_bind_address=dict(type='str', required=False),
        port_offset=dict(type='int', required=False),
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

    name = module.params['customer']
    auth_doc = module.params['auth_doc']
    connector_name = module.params['connector_name']

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

    org = get_org(api, parent_org_id, name)
    if not org:
        module.fail_json(msg=f'failed to find org {name}')

    result = get_connector(api, org["id"], connector_name).to_dict()
    # in the event of a successful module execution, you will want to
    # simple AnsibleModule.exit_json(), passing the key/value results
    module.exit_json(**result)


def main():
    run_module()


if __name__ == '__main__':
    main()
