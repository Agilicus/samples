#!/usr/bin/python
# Copyright: (c) 2022, Agilicus

from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

DOCUMENTATION = r'''

 Sample Customer Creator

   - creates a sub organisation for the customer based on input name
---
module: sample_customer

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


def get_user(api, org_id, user_type=None, email=None, search_params=None):
    kwargs = {}
    if user_type:
        kwargs["type"] = [user_type]
    if email:
        kwargs["email"] = email
    if search_params:
        kwargs["search_params"] = [search_params]
    kwargs["org_id"] = org_id
    results = api.users.list_users(**kwargs)
    if len(results.users) == 1:
        return results.users[0]
    return None


def load_yaml(auth_doc):
    with open(auth_doc, "r") as stream:
        return yaml.safe_load(stream)


def run_module():
    # define available arguments/parameters a user can pass to the module
    module_args = dict(
        auth_doc=dict(type='str', required=True),
        name=dict(type='str', required=True),
        admin_users=dict(type='str', required=False),
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

    suborg_model = agilicus.Organisation(
        organisation=name,
        subdomain=f"{name}.{parent['subdomain']}",
    )

    result = agilicus.create_or_update(
        suborg_model,
        lambda obj : api.organisations.create_sub_org(parent_org_id, obj),
    )
    suborg = result[0]

    admin_users = module.params.get('admin_users')
    if admin_users:
        sysgroup = get_user(api, suborg["id"], user_type="sysgroup", search_params="sys-admin")
        for user in json.loads(admin_users):
            user_record = get_user(api, parent_org_id, user_type="user", email=user)

            if not user_record:
                module.fail_json(msg=f"requested to add admin user which was not found in parent: {user}")

            agilicus.create_or_update(
                user_record,
                lambda obj : api.users.create_user(obj, _check_input_type=False, _host_index=0),
            )

            group_member_request = agilicus.AddGroupMemberRequest(
                user_record.id,
                suborg["id"],
            )

            agilicus.create_or_update(
                group_member_request,
                lambda obj : api.groups.add_group_member(sysgroup.id, group_member_request),
            )

    # in the event of a successful module execution, you will want to
    # simple AnsibleModule.exit_json(), passing the key/value results
    module.exit_json(**suborg)


def main():
    run_module()


if __name__ == '__main__':
    main()
