import urllib
import json, re
from time import sleep

class QuerySparql:
    SPARQL_LIMIT = 10000

    @staticmethod
    def query(endpoint_url, graph_iri, query_str, timeout=0, delay=0):
        args = {
            'default-graph-uri': graph_iri,
            'format': 'application/json',
            'query': None,
            'timeout': timeout
        }

        current_offset = 0
        result_data = []

        while True:
            args['query'] = query_str + ' LIMIT ' + str(QuerySparql.SPARQL_LIMIT) + ' OFFSET ' + str(current_offset)
            data = urllib.parse.urlencode(args)
            url = endpoint_url + '?' + data

            request = urllib.request.urlopen(url)

            response_str = request.read().decode('utf-8')
            try:
                response_data = json.loads(response_str)
            except Exception as e:
                response_str = re.sub(r'\\U[0-9A-Za-z]{8}', '', response_str)
                response_data = json.loads(response_str)

            if (response_data is None):
                return None, None

            query_vars = response_data['head']['vars']

            count = 0
            for row in response_data['results']['bindings']:
                result_row = {}
                for var in query_vars:
                    if var in row:
                        result_row[var] = row[var]['value']
                    else:
                        result_row[var] = None

                result_data.append(result_row)

                count += 1

            if len(response_data['results']['bindings']) == QuerySparql.SPARQL_LIMIT:
                current_offset += QuerySparql.SPARQL_LIMIT
            else:
                break

        if delay > 0:
            # sleep a bit to preserve endpoint sanity.
            sleep(delay)

        return result_data, url
