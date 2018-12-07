'''
REST API 처리를 담당하는 모듈 
'''
import json
import config
from db_manager import DBManager
from bottle import run, post, request, response
from operator import itemgetter
from entity_linker import DummyEntityLinker

def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if request.method != 'OPTIONS':
            return fn(*args, **kwargs)
    return _enable_cors

@post('/episode_list', method=['OPTIONS','POST'])
@enable_cors
def get_episode_list():
    DBManager.initialize(host='kbox.kaist.ac.kr', port=3142, user='root', password='swrcswrc',
                         db='KoreanWordNet2', charset='utf8', autocommit=True)
    result = DBManager.executeQuery('select * from Friends_Episode_TBL where Season=1')
    return json.dumps(result)

@post('/dialog_list', method=['OPTIONS','POST'])
@enable_cors
def get_episode_list():
    request_str = request.body.read()
    try:
        request_str = request_str.decode('utf-8')
        input_obj = json.loads(request_str)
    except:
        return '{"error":"Failed to decode request text"}'

    episodeid = input_obj['episode_id']
    DBManager.initialize(host='kbox.kaist.ac.kr', port=3142, user='root', password='swrcswrc',
                         db='KoreanWordNet2', charset='utf8', autocommit=True)
    result = DBManager.executeQuery('select * from Friends_Dialog_TBL where FND_Episode_ID="' + episodeid +'"')
    for i, item in enumerate(result):
        result[i]['FND_Dialog_ID'] = int(result[i]['FND_Dialog_ID'])
        result[i]['Dialog'] = result[i]['Dialog'].decode('utf-8')
    reulst = sorted(result, key=itemgetter('FND_Dialog_ID'))

    return json.dumps(result)


@post('/parse_result', method=['OPTIONS','POST'])
@enable_cors
def get_episode_list():
    request_str = request.body.read()
    try:
        request_str = request_str.decode('utf-8')
        input_obj = json.loads(request_str)
    except:
        return '{"error":"Failed to decode request text"}'

    speaker = input_obj['speaker']
    dialog_id = input_obj['dialog_id']
    DBManager.initialize(host='kbox.kaist.ac.kr', port=3142, user='root', password='swrcswrc',
                         db='KoreanWordNet2', charset='utf8', autocommit=True)
    result = DBManager.executeQuery('select * from Friends_CONLL_TBL where FND_Dialog_ID=' + str(dialog_id))
    result.insert(0, {'POS_text': speaker, 'lemma': speaker, 'POS_tag': 'NN'})
    entityLinker = DummyEntityLinker()
    link_list, parse_result = entityLinker.entitylink(result)
    result_obj = {'parse_result': parse_result, 'link_list': link_list}

    return json.dumps(result_obj)


DBManager.initialize(host='kbox.kaist.ac.kr', port=3142, user='root', password='swrcswrc',
                           db='KoreanWordNet2', charset='utf8', autocommit=True)

print ('Initialized')
run(host=config.host_uri, port=config.port)


