/**
 * Created by kijong on 2018-04-12.
 */

var curr_scene_id = "";
var curr_speaker = "";
var character_color = {
    "Monica": "#6610f2",
    "Ross": "#289745",
    "Joey": "#fd7e14",
    "Chandler": "#e83e8c",
    "Rachel": "#007bff",
    "Phoebe": "#17a2b8",
    "Carol": "#e0a000",
    "Paul" : "#dc3545",
    "Mindy" : "#3a3a3a",
    "Paolo" : "#3a3a3a",
    "Julie" : "#3a3a3a",
    "Judy" : "#3a3a3a",
    "Jack" : "#3a3a3a",
    "Susan" : "#3a3a3a",
    "Barry" : "#3a3a3a"
};

var character_link = {
    "Monica": "http://dbpedia.org/page/Monica_Geller",
    "Ross": "http://dbpedia.org/page/Ross_Geller",
    "Joey": "http://dbpedia.org/page/Joey_Tribbiani",
    "Chandler": "http://dbpedia.org/page/Chandler_Bing",
    "Rachel": "http://dbpedia.org/page/Rachel_Green",
    "Phoebe": "http://dbpedia.org/page/Phoebe_Buffay",
    "Carol": "http://dbpedia.org/page/List_of_Friends_characters",
    "Paul" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Mindy" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Paolo" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Julie" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Judy" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Jack" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Susan" : "http://dbpedia.org/page/List_of_Friends_characters",
    "Barry" : "http://dbpedia.org/page/List_of_Friends_characters"
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
    curr_scene_id = "s01e0" + ssceneId.substring(0,1) + "-" + ssceneId.substring(1)
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

function getWordNetModalHtml(synset, lemma_names, examples, definition, wnnmodal_id) {
    wnmodaltext = '<div class="modal fade" id="wnModal'  + wnnmodal_id
    wnmodaltext += '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">'
    wnmodaltext += 'WordNet ' + synset + '</h5>'
    wnmodaltext += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body">'
    wnmodaltext += '<div class="wn-modal-title">Definition</div>'
    wnmodaltext += '<div class="wn-modal-content">' + definition + '</div><br/>'
    wnmodaltext += '<div class="wn-modal-title">Examples</div>'
    wnmodaltext += '<div class="wn-modal-content">'
    for (var k=0; k<examples.length; k++) {
        wnmodaltext += "- " + examples[k] + '<br/>'
    }
    wnmodaltext += '<br/></div>'
    wnmodaltext += '<div class="wn-modal-title">Lemma Names</div>'
    wnmodaltext += '<div class="wn-modal-content">'
    for (var k=0; k<lemma_names.length; k++) {
        wnmodaltext += lemma_names[k]
        if (k < lemma_names.length-1)
            wnmodaltext += ','
    }
    wnmodaltext += '</div>'
    wnmodaltext += '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div></div></div></div>'
    return wnmodaltext
}

function getTripleHTML(triple, ext_links, tripleid) {
    sbj = triple['sbj']
    obj = triple['obj']

    ori_sbj = sbj
    ori_obj = obj


    if (ori_sbj in character_color) {
        sbj = '<span style="font-weight:bold; color:' + character_color[ori_sbj] + ';"><u>' + sbj + "</u></span>"
        //sbj = '<font weight="bold" color="' + character_color[ori_sbj] + '">' + sbj + "</font>"
    }

    if (ori_obj in character_color) {
        obj = '<span style="font-weight:bold; color:' + character_color[ori_obj] + ';"><u>' + obj + "</u></span>"
        //obj = '<font weight="bold" color="' + character_color[ori_obj] + '">' + obj + "</font>"
    }


    if (ori_sbj in character_link) {
        sbj = '<a target="_blank" href="' + character_link[ori_sbj] + '">' + sbj + "</a>"
    }
    if (ori_obj in character_link) {
        obj = '<a target="_blank" href="' + character_link[ori_obj] + '">' + obj + "</a>"
    }

    triple_text = "＜" + sbj + " - " + triple['rel'] + " - " + obj + "＞";

    //triple_text += '<a class="vtt-btn btn btn-info" data-toggle="collapse" href="#collapseTriple'
    triple_text += '<a class="vtt-bar-icon" data-toggle="collapse" href="#collapseTriple'
    triple_text += tripleid
    triple_text += '" role="button" aria-expanded="false" aria-controls="collapseExample">'
    triple_text += '<span class="fas fa-bars"></span></a>'
    //triple_text += '<img src="menu.png" style="width:20px; height:18px;"></img></a>'

    triple_text += '<div class="collapse" id="collapseTriple'
    triple_text += tripleid
    triple_text += '">'
    triple_text += '<br/><div class="card card-body" style="font-size:1.2rem"><div line-height="1.2">'


    // ******FrameNet Link
    frames = ext_links['frame']
    if (frames.length > 1) {
        word = frames[0]

        for (var ii=1; ii<frames.length; ii++) {
            triple_text +=  "＜" + word + " - "
            triple_text +=  '<a target="_blank" href="https://framenet.icsi.berkeley.edu/fndrupal/">frame</a> - '

            frame_url = 'https://framenet2.icsi.berkeley.edu/fnReports/data/frame/' + frames[ii] + '.xml'
            triple_text += '<a target="_blank" href="' + frame_url + '">' + frames[ii] + "</a>＞" + '</br>';
        }
    }

    // ******WordNet Link
    synsets = ext_links['synsets']
    word = ""
    for (var ii=0; ii<synsets.length; ii++) {
        synset = synsets[ii]
        word = synset['lemma']

        wnnmodal_id = tripleid + '-' + ii.toString()

        triple_text +=  "＜" + word + " - "
        triple_text +=  '<a target="_blank" href="https://wordnet.princeton.edu/">wn</a> - '
        triple_text += '<a data-toggle="modal" href="#wnModal' + wnnmodal_id + '">'  
        triple_text += synset['synset'].replace("Synset('","").replace(")","") + '</a>＞' + '</br>'
        triple_text += getWordNetModalHtml(synset['synset'], synset['lemma_names'], synset['_examples'], synset['definition'], wnnmodal_id)
    }

    if (word.length > 1) {
        triple_text +=  "＜" + word + " - "
        triple_text +=  '<a target="_blank" href="http://conceptnet.io">cn</a> - '
        conceptnet_url = 'http://conceptnet.io/c/en/' + word
        triple_text += '<a target="_blank" href="' + conceptnet_url + '">' + word + "</a>＞" + '</br>'
    }

    triple_text += '</div></div>'

    return triple_text
}

function getSentIdHTML(sentid, tokens, characters, ttid) {
    sent = ""
    text = ""
    ttid = "tt" + ttid
    for (var i=0; i<tokens.length; i++) {
        if (characters[i].length > 1) {
            if (characters[i] in character_color) {
                c_color = character_color[characters[i]]
            } else {
                c_color = "#3a3a3a"
            }

            if (characters[i] in character_link) {
                c_link = character_link[characters[i]]
            } else {
                c_link = "http://dbpedia.org/page/List_of_Friends_characters"
            }
            fragment = '<span style="font-weight:bold; color:' + c_color + ';"><u>' + tokens[i]['word'] + "</u> </span>"
            fragment = '<a target="_blank" href="' + c_link + '">' + fragment + "</a>"
            text = text + fragment
        } else {
            text = text + tokens[i]['word'] + ' '
        }
    }

    sentid_text = '<a class="vtt-toggle" data-toggle="collapse" href="#collapseTriple'
    sentid_text += ttid
    sentid_text += '" role="button" aria-expanded="false" aria-controls="collapseExample">'
    sentid_text += '<u>' + sentid + '</u></a>'

    sentid_text += '<div class="collapse" id="collapseTriple'
    sentid_text += ttid
    sentid_text += '">'
    sentid_text += '<br/><span class="card card-body" style="font-size:1.3rem"><div style="line-height:1.2">'
    sentid_text += text + '</div></span>'

    return sentid_text
}

function updateKnowledgeList(data) {
    data = data['knowledges']

    $('#vtt-tbody').empty()

    speaker_list = ["Ross", "Rachel", "Joey", "Monica", "Chandler", "Phoebe"]

    table_text = ""

    t_count = 0
    ttid = 0
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
            if (item['triple']['sbj'] == item['triple']['obj']) {
                continue
            }

            sentid = curr_scene_id + '-' + item['sid']
            intention = item['intention']

            table_text += '<tr>'

            speaker_html = '<span style="font-weight:bold; color:' + character_color[speaker] + ';"><u>' + speaker + "</u></span>"
            speaker_html = '<a target="_blank" href="' + character_link[speaker] + '">' + speaker_html + "</a>"
            table_text += '<th class="custom-th">' + speaker_html + '</th>'
            
            ttid += 1
            table_text += '<th class="custom-th">' + getSentIdHTML(sentid, item['tokens'], item['characters'], ttid) + '</th>'
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

function getItemFromUrl(url) {
    items = url.split('/')
    return items[items.length-1]
}

