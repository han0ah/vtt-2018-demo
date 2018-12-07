/**
 * Created by kijong on 2018-04-12.
 */

var curr_dialog_id = -1;
var curr_speaker = "";

function onWebPageLoad() {
    for (i=1;i<=23;i++) {
        item = $('<button>')
        item.attr('onclick','setEpisodeItemClicked(' + i.toString() + ')')
        item.attr('type', 'button')
        item.attr('class', 'list-group-item list-group-item-action')
        item.attr('id', 'episode-group-item-' + i.toString())
        item.text('Season1 Episode' + i.toString())
        $('#episode-list-group').append(item)
    }
    $('.progress-area').hide()
}

function setEpisodeItemClicked(episodeId) {
    var _episodeId = episodeId
    curr_dialog_id = -1
    curr_speaker = ""

    $('#episode-list-group').children().each(function(){
        curr_id = Number(this.id.substring(19))
        $(this).removeClass('active')

        if (curr_id == _episodeId){
            $(this).addClass('active')
        }
    })
    $('.progress-area').show()
    getDialogListOfEpisode(episodeId)
}

function getDialogListOfEpisode(episodeId) {
    episodeIdFormal = "S1E" + episodeId.toString()
    jsonInput = '{"episode_id":"' + episodeIdFormal + '"}'
    $.post('http://localhost:5003/dialog_list', jsonInput, function(data) {
        updateDialogList(JSON.parse(data))
    });
}

function updateDialogList(data) {
    $('#dialog-list-group').empty()
    for (i=0;i<data.length;i++) {
        dialog_id = data[i]['FND_Dialog_ID']
        dialog_character = data[i]['Character_']
        dialog_str = data[i]['Dialog']

        if (dialog_character == "Stage direction")
            continue;

        item = $('<button>')
        item.attr('onclick','setDialogItemClicked(' + dialog_id.toString() + ',"' + dialog_character + '")')
        item.attr('type', 'button')
        item.attr('class', 'list-group-item list-group-item-action')
        item.attr('id', 'dialog-group-item-' + data[i]['FND_Dialog_ID'].toString())

        item.text(dialog_character + ' : ' + dialog_str)
        $('#dialog-list-group').append(item)
    }
    $('.progress-area').hide()
}

function setDialogItemClicked(dialogId, speaker) {
    var _dialogId = dialogId
    $('#dialog-list-group').children().each(function(){
        curr_id = Number(this.id.substring(18))
        $(this).removeClass('active')

        if (curr_id == _dialogId){
            $(this).addClass('active')
        }
    })
    curr_dialog_id = dialogId
    curr_speaker = speaker
}

function parseDialog() {
    if (curr_dialog_id == -1)
        return;

    $('.progress-area').show()

    jsonInput = '{"dialog_id":' + curr_dialog_id + ',"speaker":"'  + curr_speaker + '"}'
    $.post('http://localhost:5003/parse_result', jsonInput, function(data) {
        writeParseResult(JSON.parse(data))
        $('.progress-area').hide()
    });
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

