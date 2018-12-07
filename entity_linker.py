import nltk
from sparql_communicator import QuerySparql
from nltk.corpus import stopwords

class DummyEntityLinker:

    def __init__(self):
        self.stopwords_set = set(stopwords.words('english'))

    def set_lemma_for_character(self, item):
        monica = ['monica', 'monica_geller']
        phoebe = ['phoebe']
        rachel = ['rachel']
        joey = ['joey']
        chandler = ['chandler']
        ross = ['ross']

        item['is_figure'] = False

        if (item['POS_text'].lower() in monica):
            item['lemma'] = 'monica_geller'
            item['is_figure'] = True

        if (item['POS_text'].lower() in phoebe):
            item['lemma'] = 'phoebe_buffay'
            item['is_figure'] = True

        if (item['POS_text'].lower() in rachel):
            item['lemma'] = 'rachel_green'
            item['is_figure'] = True

        if (item['POS_text'].lower() in joey):
            item['lemma'] = 'joey_tribbiani'
            item['is_figure'] = True

        if (item['POS_text'].lower() in chandler):
            item['lemma'] = 'chandler_bing'
            item['is_figure'] = True

        if (item['POS_text'].lower() in ross):
            item['lemma'] = 'ross_geller'
            item['is_figure'] = True

        return item

    def reconstruct_high_order_property(self, result, isForFigure):
        if (isForFigure):
            no_word_list = ['HasProperty', 'IsA']
        else:
            no_word_list = ['sameAs', 'Synonym', 'Antonym', 'External', 'RelatedTo', 'Derived', 'Etymologi']
        new_result = []
        for turn in range(2):
            for i,item in enumerate(result):
                isOk = True
                if turn == 0:
                    result[i]['is_selected'] = 0
                    for no_word in no_word_list:
                        if no_word in item['p']:
                            isOk = False
                            break
                if (result[i]['is_selected'] == 1 or ('sameAs' in item['p']) or ('External' in item['p']) or ('Etymologi' in item['p']) or ('Derived' in item['p'])):
                    isOk = False
                if (isOk):
                    new_result.append(item)
                    result[i]['is_selected'] = 1

        if (len(new_result) < 2):
            return result
        return new_result

    def entitylink(self, parse_result):

        link_list_vocab = []
        link_list = []

        for idx, item in enumerate(parse_result):

            parse_result[idx] = self.set_lemma_for_character(item)
            parse_result[idx]['link_idx'] = -1

            if (item['lemma'] in link_list_vocab):
                parse_result[idx]['link_idx'] = link_list_vocab.index(item['lemma'])
                continue
            if (item['lemma'] in self.stopwords_set):
                continue
            if (not (item['POS_tag'].startswith('NN') or
                    item['POS_tag'].startswith('RB') or
                    item['POS_tag'].startswith('JJ') or
                    item['POS_tag'].startswith('VB'))):
                continue

            querystr = 'select ?p ?o { <http://kbox.kaist.ac.kr/vtt/resource/{{lemma}}> ?p ?o }'.replace('{{lemma}}',item['lemma'])
            graph_iri = 'http://kbox.kaist.ac.kr/vtt/friends' if (parse_result[idx]['is_figure']) else  'http://kbox.kaist.ac.kr/vtt/cs'

            result, refined_url = QuerySparql.query('http://kbox.kaist.ac.kr:7190/sparql', graph_iri, querystr)
            if (len(result) < 1):
                continue

            link_list_vocab.append(item['lemma'])
            result = self.reconstruct_high_order_property(result, parse_result[idx]['is_figure'])
            if (len(result) > 10):
                result = result[0:10]
            link_list.append({'lemma':item['lemma'],
                              'triple_list':result,
                              'url':refined_url})
            parse_result[idx]['link_idx'] = len(link_list_vocab) - 1

        return link_list, parse_result

'''
from sparql_communicator import QuerySparql

a = QuerySparql()

result = a.query('http://kbox.kaist.ac.kr:7190/sparql','http://kbox.kaist.ac.kr/vtt/friends','select ?p ?o { <http://kbox.kaist.ac.kr/vtt/resource/ross_geller> ?p ?o }')
print (result)
'''