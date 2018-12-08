/**
 * Created by kijong on 2018-04-12.
 */

var curr_scene_id = "";
var curr_speaker = "";
var character_color = {
    "Monica": "#6610f2",
    "Ross": "#e83e8c",
    "Joey": "#fd7e14",
    "Chandler": "#289745",
    "Rachel": "#007bff",
    "Phoebe": "#17a2b8",
    "Carol": "#ffc107",
    "Paul" : "#dc3545"
};

var character_link = {
    "Monica": "http://dbpedia.org/page/Monica_Geller",
    "Ross": "http://dbpedia.org/page/Ross_Geller",
    "Joey": "http://dbpedia.org/page/Joey_Tribbiani",
    "Chandler": "http://dbpedia.org/page/Chandler_Bing",
    "Rachel": "http://dbpedia.org/page/Rachel_Green",
    "Phoebe": "http://dbpedia.org/page/Phoebe_Buffay"
}


function onWebPageLoad() {

    var scene_list = [[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],
    [2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],
    [3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],
    [4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],
    [5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8]]

    for (i=0; i<42; i++) {
        epiid = scene_list[i][0]
        sceneid = scene_list[i][1]

        item = $('<button>')
        item.attr('onclick','setSceneItemClicked(' + epiid.toString() + sceneid.toString() + ')')
        item.attr('type', 'button')
        item.attr('class', 'list-group-item list-group-item-action')
        item.attr('id', 'episode-group-item-' + epiid.toString() + sceneid.toString())
        item.text('Season1 Episode' + epiid.toString() + ' Scene' + (sceneid+1).toString())
        $('#episode-list-group').append(item)
    }
    $('.progress-area').hide()
}

function setSceneItemClicked(sceneId) {
    var _sceneId = sceneId
    $('#episode-list-group').children().each(function(){
        curr_id = Number(this.id.substring(19,21))
        $(this).removeClass('active')

        if (curr_id == _sceneId){
            $(this).addClass('active')
        }
    })

    ssceneId = sceneId.toString()
    curr_scene_id = "s01e0" + ssceneId.substring(0) + "-" + ssceneId.substring(1)
    $('.progress-area').show()
    getSceneKnowledge(sceneId)
}

function getSceneKnowledge(sceneId) {
    jsonInput = '{"scene_id":' + sceneId.toString() + '}'
    $.post('http://143.248.135.139:5003/get_result', jsonInput, function(data) {
        updateKnowledgeList(JSON.parse(data))
        $('.progress-area').hide()
    });
}

function getTripleHTML(triple, ext_links, tripleid) {
    sbj = triple['sbj']
    obj = triple['obj']

    ori_sbj = sbj
    ori_obj = obj

    if (sbj in character_link) {
        sbj = '<a target="_blank" href="' + character_link[sbj] + '">' + sbj + "</a>"
    }
    if (obj in character_link) {
        obj = '<a target="_blank" href="' + character_link[obj] + '">' + obj + "</a>"
    }

    if (ori_sbj in character_color) {
        sbj = '<font weight="bold" color="' + character_color[ori_sbj] + '">' + sbj + "</font>"
    }

    if (ori_obj in character_color) {
        obj = '<font weight="bold" color="' + character_color[ori_obj] + '">' + obj + "</font>"
    }

    triple_text = "＜" + sbj + " - " + triple['rel'] + " - " + obj + "＞";

    triple_text += '<a class="vtt-btn btn btn-info" data-toggle="collapse" href="#collapseTriple'
    triple_text += tripleid
    triple_text += '" role="button" aria-expanded="false" aria-controls="collapseExample">'
    triple_text += 'More </a>'

    triple_text += '<div class="collapse" id="collapseTriple'
    triple_text += tripleid
    triple_text += '">'
    triple_text += '<br/><div class="card card-body" style="font-size:1.2rem">'

    frames = ext_links['frame']
    
    if (frames.length > 1) {
        word = frames[0]

        for (var ii=1; ii<frames.length; ii++) {
            triple_text +=  "＜" + word + " - " + "frame" + " - " + frames[ii] + "＞" + '</br>';
        }
    }

    triple_text += '</div>'

    return triple_text
}

function updateKnowledgeList(data) {
    data = data['knowledges']

    $('#vtt-tbody').empty()

    speaker_list = ["Ross", "Rachel", "Joey", "Monica", "Chandler", "Phoebe"]

    table_text = ""

    t_count = 0
    for(var speakerid=0; speakerid<6; speakerid++){
        curr_speaker = speaker_list[speakerid];
        for(var i=0; i<data.length; i++) {
            item = data[i]
            speaker = item['speaker']
            if (speaker != curr_speaker) {
                continue
            }

            if (item['triple']['rel'].length < 2) {
                continue
            }
            if (item['triple']['sbj'].indexOf("do n't , to hell") !== -1) {
                continue
            }

            sentid = curr_scene_id + '-' + item['sid']
            intention = item['intention']

            table_text += '<tr>'
            table_text += '<th class="custom-th">' + speaker + '</th>'
            table_text += '<th class="custom-th">' + sentid + '</th>'
            table_text += '<th class="custom-th" style="font-size:1.0rem">'
            for (var j=0; j<intention.length; j++) {
                table_text += intention[j]
                if (j != intention.length-1) {
                    table_text += ', '
                }
            }
            table_text += '</th>'
            table_text += '<th class="custom-th">'

            t_count += 1
            table_text += getTripleHTML(item['triple'], item['ext_links'], t_count.toString())
            table_text += '</th>'
            table_text += '</tr>'
        }
    }

    $('#vtt-tbody').append(table_text)
}


function writeParseResult(data) {
    $('.parsed-text').empty()
    $('.entity-triples').empty()

    var color_list = ['blue', 'green', 'red', 'orange', 'purple', 'pink', 'indigo', 'gray-dark', 'dark', 'dark', 'dark', 'dark']
    parse_result = data['parse_result']



    parse_text = ''
    for (i=0; i<parse_result.length; i++) {
        item = parse_result[i]
        if (item['link_idx'] < 0 || item['link_idx'] > 11)
            parse_text += item['POS_text'] + ' '
        else
            parse_text += '<span style="color:' + color_list[item['link_idx']] +'; font-weight:bold;">' + item['POS_text'] + ' </span>'
        if (i == 0)
            parse_text += ': '
    }

    $('.parsed-text').html(parse_text)

    link_list = data['link_list']
    for (i=0; i<link_list.length; i++) {
        item = link_list[i]
        entity_title_item = $('<div>')
        entity_title_item.html('<span style="color:' + color_list[i] +'; font-weight:bold; font-size:1.3em">' + item['lemma'] + ' </span>')
        $('.entity-triples').append(entity_title_item)

        table_text = '<table class="table table-bordered custom-table"><tobdy>'

        if (item['triple_list'].length > 6)
            triple_length = 6
        else
            triple_length = item['triple_list'].length
        for(j=0; j<triple_length; j++) {
            table_text += '<tr>'
            triple_item = item['triple_list'][j]
            p = getItemFromUrl(triple_item['p'])
            o = getItemFromUrl(triple_item['o'])
            table_text += '<th class="custom-th">' + '<a target="_blank" href="' + 'http://kbox.kaist.ac.kr/vtt/resource/' + item['lemma'] + '">' + item['lemma'] + '</a></th>'
            table_text += '<th class="custom-th">' + '<a target="_blank" href="' + triple_item['p'] + '">' + p + '</a></th>'
            table_text += '<th class="custom-th">' + '<a target="_blank" href="' + triple_item['o'] + '">' + o + '</a></th>'
            table_text += '</tr>'
        }
        table_text += '</tbody></table>'
        $('.entity-triples').append(table_text)
        $('.entity-triples').append('<div class="see-more-text">' + '<a target="_blank" href="' + item['url'] + '">' + ' ...See all triples of ' + item['lemma'] + '</a></div>')

    }
}

function getItemFromUrl(url) {
    items = url.split('/')
    return items[items.length-1]
}

