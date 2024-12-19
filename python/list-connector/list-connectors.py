"""
Sample: list-connector

Find all connectors. List their create-date, name, status
"""

import agilicus
import agilicus_api
import argparse
import sys
import datetime
import dateparser
from dateutil.tz import tzutc

scopes = agilicus.scopes.DEFAULT_SCOPES

parser = argparse.ArgumentParser(description="list-connector")
parser.add_argument("--auth-doc", type=str)
parser.add_argument("--issuer", type=str)
args = parser.parse_args()


if not args.auth_doc and not args.issuer:
    print("error: specify either an --auth-doc or --issuer (e.g. https://auth.MYDOMAIN)", file=sys.stderr)
    sys.exit(1)

api = agilicus.GetClient(
    agilicus_scopes=scopes, issuer=args.issuer, authentication_document=args.auth_doc
)


def api_retry(method, **kwargs):
    try:
        return method(**kwargs)
    except agilicus_api.exceptions.UnauthorizedException:
        return method(**kwargs)


def get_all_connectors():
    """Get all connectors, regardless of current state (enabled/disabled).
       Handle pagination.
       See https://www.agilicus.com/api/ """

    done = False
    plimit = 500
    page_at_id = ""

    print("ID,Name,Created")
    while done is False:
        print(f"FETCH connectors from page-key {page_at_id}", file=sys.stderr)
        result_connectors = api_retry(method=api.connectors.list_agent_connector,
                                      org_id=api.default_org_id,
                                      limit=plimit,
                                      page_at_id=page_at_id)

        page_at_id = str(result_connectors.page_at_id)
        for connector in result_connectors.agent_connectors:
            print(f"{connector.metadata.id},{connector.spec.name},{connector.metadata.created}",file=sys.stdout)

        if len(result_connectors.agent_connectors) == 0 or len(page_at_id) == 0:
            done = True
            break


connectors = get_all_connectors()


