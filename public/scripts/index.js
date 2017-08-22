
var REST_DATA = 'api/opportunities';
var KEY_ENTER = 13;

function loadOpportunities(viewName) {
    showLoadingMessage();
    var url = '/api/opportunities';
    if(viewName)
        url += "?view="+viewName;
    
    
    xhrGet(url, function(data) {
        console.log(JSON.stringify(data));
        drawOpportunities(data);
    }, function(err) {
        stopLoadingMessage();
        console.error(err);
    });
}

function searchOpportunities(){
    showLoadingMessage();
    var url = '/api/opportunities/query?q='+$("#q").val();
    console.log("Searching for : " + $("#q").val());
    xhrGet(url, function(data) {
        console.log('returned the '+data.length+' opps.');
        console.log(JSON.stringify(data));
        drawOpportunities(data);
    }, function(err) {
        stopLoadingMessage();
        console.error(err);
    });
}

function drawOpportunities(opportunities){
    clearOpportunities();
    if(opportunities||opportunities.length>0)
        opportunities.forEach(function(item) {
            if (item && 'id' in item) 
                drawOpportunityRow(item); //render the row
        });
    
    drawOpportunityRow(preprocessData({})); //draw a blank row
    stopLoadingMessage();

    $( ".xsave" ).on( "click", function() {
        alert($(this).closest('tr').get(0));
    });
}

function drawOpportunitiesHeader(){
    var $tr = $('<tr>', {id:'oppheader'}).appendTo($('<thead>', {}).appendTo('#opps'));
    fields.forEach(function(field) {
        var f = getFieldByName(field.name);
        if(!field.hidden)
            $('<th>', {class:'contentHeader', html:field.label}).appendTo($tr);
    });
    $('<th>', {class:'actionHeader', html:'Actions'}).appendTo($tr);
}

function drawOpportunityRow(item) {
    var isNew = !item;
    var itm = item || {};
    var id = itm.id;
    var row = document.createElement('tr');
    var table = document.getElementById('opps');
    row.className = "tableRows";
    row.item=itm;
    row.item_original = itm;
    if (id) row.setAttribute('data-id', id);
    table.appendChild(row);
    row.isNew = isNew;
    
    fields.forEach(function(field) {
        if(!field.hidden){
        var td = document.createElement('td');
        td.className='contentDetails';
        td.field = field.name;
        row.appendChild(td);
        var type = field.type||'text';
        switch(field.type){
            case 'text':
                if(field.options)
                    drawDropDown(id, row, td, field, item);
                else
                    drawTextArea(id, row, td, field, item);
            break;
            case 'checkbox':
                drawTextArea(id, row, td, field, item, true);
            break;
            default:
                drawTextArea(id, row, td, field, item);
            break;
        }
        }
    }, this);
    
    var $tdaction = $('<td>', {class:'contentAction'}).appendTo($(row));
    
    $saveBtn = $('<button>', {class:'btn btn-default btn-xs', title:'Save'}).appendTo($tdaction).click(function(){
        if(!$(this).hasClass('disabled'))   //Only save when the button is enabled
            saveItem(row);
    });
    $('<span>', {class:'glyphicon glyphicon-floppy-disk'}).appendTo($saveBtn);
    


    $deleteBtn = $('<button>', {class:'btn btn-default btn-xs', title:'Delete'}).appendTo($tdaction).click(function(){
        if(!$(this).hasClass('disabled'))   //Only save when the button is enabled
            deleteItem(row);
    });
    $('<span>', {class:'glyphicon glyphicon-trash'}).appendTo($deleteBtn);
    
    

    $('<span>', {class:'showdocBtn'}).appendTo($tdaction).click(function(){
        alert(JSON.stringify(row.item));
    });
    if (row.isNew) {
        $(row).find('textarea[readonly!=\'readonly\']')[0].focus()
    }
}

function drawTextArea(id, row, td, field, item, readonly){
    //console.log('Rendering field: ' +field.name);
    var textArea = document.createElement('textarea');
    textArea._row = row;
    textArea.setAttribute('field', field.name);
    textArea.setAttribute('id', field.name+(id||''));
    textArea.setAttribute('placeholder', field.placeholder);
    textArea.setAttribute('rows', 1);
    if(readonly||field.readonly) {
        textArea.setAttribute('readonly', 'readonly');
    }
    textArea.addEventListener('blur', function(evt){syncRowData(evt.target)});
    textArea.addEventListener('keydown', onKey);
    var val = field.getDisplayValue?field.getDisplayValue(item):field.getValue(item);
    //console.log(val);
    textArea.value = val;
    td.appendChild(textArea);
    autosize(textArea);
}

function drawDropDownx(id, row, td, field, item, readonly){
    var dropDown = document.createElement('select');
    dropDown._row = row;
    dropDown.setAttribute('field', field.name);
    dropDown.setAttribute('id', field.name+(id||''));
    if(readonly||field.readonly) {
        dropDown.setAttribute('readonly', 'readonly');
    };
    var val = field.getDisplayValue?field.getDisplayValue(item):field.getValue(item);

    if(field.options){
        field.options.forEach(function(o) {
            var op = document.createElement('option');
            op.text = (typeof o == 'string')?(o):(o.label);
            dropDown.add(op);
        }, this);
    }
    dropDown.value = val;
    td.appendChild(dropDown);

    $( dropDown ).selectmenu({ 
        change: function( event, ui ) { 
            syncRowData(this);
        }, 
        row: row, 
        field:field
    });
}

function drawDropDown(id, row, td, field, item, readonly){
  
    // var $dd = $('<div>', {class: 'dropdown',}).appendTo($(td));
    // var $btn = $('<button>', {
    //                             style :'width:100%', 
    //                             class: 'btn btn-default dropdown-toggle btn-xs', 
    //                             'data-toggle':'dropdown', 
    //                             //text: field.getDisplayValue?field.getDisplayValue(item):field.getValue(item)
    //                         }
    //         ).appendTo($dd);
    // var $txt = $('<span>', { style: 'width: "100%"', class: 'dropdownText', text:  field.getDisplayValue?field.getDisplayValue(item):field.getValue(item)}).appendTo($btn);
    // var $caret = $('<span>', {class: 'caret'}).appendTo($btn);
    // var $ul = $('<ul>', {class:'dropdown-menu'}).appendTo($dd);

    
    // var $li = $('<li>').appendTo($ul);
    // $('<a>', {text: 'ss'}).appendTo($li);
    
    // var attrs =  {
    //     row:row, 
    //     field:field.name,
    //     id:field.name+(id||''), 
    //     text: field.getDisplayValue?field.getDisplayValue(item):field.getValue(item),
    //     change: function( event, ui ) { 
    //         syncRowData(this);
    //     }
    // };
    // if(readonly||field.readonly) attrs.readonly = readonly;
    // var $dd = $('<select>', attrs).appendTo($(td));
    // if(field.options){
    //     field.options.forEach(function(o) {
    //         var $op = $('<option>', {text: (typeof o == 'string')?(o):(o.label)}).appendTo($dd);
    //     }, this);
    // }
    // $dd.selectmenu({ 
    //     change: function( event, ui ) { 
    //         syncRowData(this);
    //     }
    // });

    var dropDown = document.createElement('select');
    dropDown._row = row;
    dropDown.setAttribute('field', field.name);
    dropDown.setAttribute('id', field.name+(id||''));
    if(readonly||field.readonly) {
        dropDown.setAttribute('readonly', 'readonly');
    };
    var val = field.getDisplayValue?field.getDisplayValue(item):field.getValue(item);

    if(field.options){
        field.options.forEach(function(o) {
            var op = document.createElement('option');
            op.text = (typeof o == 'string')?(o):(o.label);
            dropDown.add(op);
        }, this);
    }
    dropDown.value = val;
    td.appendChild(dropDown);
    
    $( dropDown ).selectmenu({ 
        change: function( event, ui ) { 
            syncRowData(this);
        }, 
        row: row, 
        field:field
    });
}

function deleteItem(row) {
    if(!confirm('Are you sure you want to delete the item?')) return;
    var itm = row.item;
    if (itm.id) {
        xhrDelete(REST_DATA + '?id=' + itm.id, function() {
            row.remove();
        }, function(err) {
            alert('A error occurred while deleting the record.\n\n\t'
                + err
                + '\n\n\tRecord ID : '+itm.id+'\n\n');
            console.error(err);
        });
    } else {
        row.remove();
    }
}

function saveItem(row){
    showLoadingMessage();
    var data = row.item;
    preprocessData(data);
    if (row.isNew) {
            delete row.isNew;
            xhrPost(REST_DATA, data, function(item) {
                row.item.id = item.id;
                row.setAttribute('data-id', item.id);
            }, function(err) {
                console.error(err);
            });
    } else {
        xhrPut(REST_DATA, data, function() {
            console.log('updated: ', data);
        }, function(err) {
            alert('Update Failed')
            console.error(err);
        });
    }
    stopLoadingMessage();
}

function onKey(evt) { 
    if (evt.keyCode == KEY_ENTER && !evt.shiftKey) {
        evt.stopPropagation();
        evt.preventDefault();
        setTimeout(function(){
            syncRowData(evt.target);
            var row = evt.target.parentNode.parentNode;
            saveItem(row);
            if (row.nextSibling)
                row.nextSibling.firstChild.firstChild.focus();
            else 
                drawOpportunityRow();
        },0);
    } else {
        autosize(evt.target);
    }
}

function syncRowData(el){
    var field = el.getAttribute('field');
    var row = el.parentNode.parentNode; 
    var item = row.item;
    item[field] = el.value;
}

function preprocessData(data){
   
    //fix up a few fields from serializeObject
    data.born_on_cloud = (data.born_on_cloud&&data.born_on_cloud=='on')?('true'):('false');

    fields.forEach(function(field) {
        if(field.multi){
            if(!data[field.name]) data[field.name] = [];
            if((typeof data[field.name])=='string')         //For multiselect items when only one item is selected it 
                data[field.name] = [data[field.name]];      //comes back as a string make it an array with one item
        }
        //Handle 'required' fields
        if(field.required){
            console.log('Field \'' + field.name +'\' is required.');
            //Remove any empty values
            if(data[field.name]&&(data[field.name]==''||data[field.name]=='-1'))
                delete data[field.name];
            
            if(!data[field.name]){  //See if the field exists
                if(field.getDefaultValue){  //See if we can get a default value
                    var val = field.getDefaultValue();
                    data[field.name] = val;
                }else{
                    console.log('Warning: Required field \'' + field.name + '\' is missing and has no default value.');
                }
            }
        }
    });
    return data;
}

function clearOpportunities(){
    $('#opps').children().get().forEach(function(item, idx){
        if(idx>0)item.remove();
    });
}

function encodeUriAndQuotes(untrustedStr) {
    return encodeURI(String(untrustedStr)).replace(/'/g, '%27').replace(')', '%29');
}

function toggleAppInfo() {
    var node = document.getElementById('appinfo');
    node.style.display = node.style.display == 'none' ? '' : 'none';
}

function showLoadingMessage() {
    document.getElementById('loadingImage').innerHTML = "Loading data " + "<img height=\"100\" width=\"100\" src=\"images/loading.gif\"></img>";
}

function stopLoadingMessage() {
    document.getElementById('loadingImage').innerHTML = "";
}

function disableForm(){
    $("button").hide();
}
       
function init(){
    $("#debug").on("click", function(){ toggleDebug(); });
    
    var vs = $('a[viewname').click(function(evt){
        var $el = $(evt.target);
        var viewname = $el.attr('viewname');
        var displayname = $el.text();
        setCurrentView(viewname, displayname);

    });

    

    drawOpportunitiesHeader();
    setCurrentView();
}

function setCurrentView(view, displayname, ){
    var defaultview = 'unassigned_opps';
    var defaultviewname = 'Unassigned Oportunities';
    var _view = view||$.cookie('view');
    if(!_view) view=defaultview;
    var  _display = displayname||$.cookie('viewdisplay');
    if(!_display)
        _display=(view==defaultview)?(defaultviewname):(view||'');
    $.cookie('view', _view);
    $.cookie('viewdisplay',_display);
    $('#curview').html(_display);
    loadOpportunities(_view);
}

$().ready(function(){
    if(authenticate()){
        init();
    } else {
        disableForm();
    }
});

function authenticate(){
    var pwd = $.cookie('pwd');
    if(!pwd||pwd==undefined)
        pwd = prompt('Password');
    if(!pwd||pwd.toLowerCase()!='tyler'){
        alert('Invalid password');
        
        return false;
    }
    $.cookie('pwd', pwd);
    return true;
}

function getFieldByName(name){
    var _field;
    fields.forEach(function(field, index){
        if(name == field.name){
            _field = field;
            return;
        }
    });
    return _field;
}

function enableDebug(){

}

function disableDebug(){

}

function toggleDebug(){
    // var debug = $.cookie('debug') == 'true';
    // $.cookie('debug',!debug);
    // alert(debug);
    alert(debug.enabled());
    alert(debug.toggle());
    alert(debug.toggle());

}
var debug = {
    enabled: function(_enabled){ 
        if(_enabled != undefined)
            $.cookie('debug',_enabled);
        return $.cookie('debug') == 'true'; },
    toggle: function(){return this.enabled(!this.enabled());},
    enable: function(){
        this.enabled(true);

    },
    disable: function(){}

};

