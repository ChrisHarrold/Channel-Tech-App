var REST_DATA = 'api/opportunities';
var data = {};
//Initialize the form once the page is ready 
$().ready(function(){
    initForm();
});

//Initialize the form on load
function initForm(){
    //When the form loads 'scrub' the fields object by setting some default values
    fields.forEach(function(field) {
        if(!field.type) field.type = 'text';
        if(!field.getDisplayValue) field.getDisplayValue = field.getValue;
        if(!field.placeholder) field.placeholder = '';
        if(!field.label) field.label = name;
        if(!field.readonly) field.readonly = false;
        if(!field.required) field.required = false;
        if(!field.multi) field.multi = false;
    });
   
    $('select').change(function(){
        var $this = $(this);
        $this.toggleClass('unselectedDropdown', $this.val()=='');
    });
    $('select').click(); //call click() on all selects one time to set the initial style based on value
    //Atach the autosize method to the keydown event on the notes textbox
    $('textarea[name="notes"]').keydown(function(){
        autosize(this);
    });
}

function saveOpportunity(){
    if(validateForm()){
        xhrPost(REST_DATA, data, function(item) {
                console.log('Item saved with ID - ' + item.id); 
                alert('Saved');
                resetForm();
            }, function(err) {
                alert('An error occurred while saving the form.\n\n' + err);
                console.error(err);
        });
    }
    
}

function resetForm(){
    var repName = $('#txtSourceRep').val();
    $('#main')[0].reset();
    $('select').change(); //call change() on all selects to set the initial style based on value
    $('#txtSourceRep').val(repName);
}

function validateForm(){
    syncFormWithData(); //Make sure the data object is sync'd with the form data
    var missingFields = [];
    fields.forEach(function(field) {
    if(field.required               //If field is required
        &&(                         //AND
            !data[field.name]       //field is missing from data - this means it is not in the form
            ||                      //OR
            data[field.name]==''    //field is blank - it is on the form, but the user did not fill it in
            ||                      //OR
            data[field.name]==[]    //field is empty array - it in the form but the user has no selected any options
        ))                          //THEN
        missingFields.push(field);  //Add to missing field list
    });
    
    if(missingFields.length>0){     //If any fields are still missing, show an error
        var msg = "The following required fields are missing\n\n"
        missingFields.forEach(function(f) {
            msg+='    -  '+f.label+'\n';
        }, this);
        alert(msg);
    }
   
    return missingFields.length == 0;   //Return false if any required fields are missing
}

//Synchronize the form with the data variable
function syncFormWithData(){
    //Start by serializing the form
    data = $('#main').serializeObject();
    //fix up a few fields from serializeObject
    data.born_on_cloud = (data.born_on_cloud&&data.born_on_cloud=='on')?('true'):('false');

    fields.forEach(function(field) {
        if(field.multi){
            if(!data[field.name]) data[field.name] = [];
            if((typeof data[field.name])=='string')  {       //For multiselect items when only one item is selected it 
                data[field.name] = [data[field.name]];      //comes back as a string make it an array with one item
                }      
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
}

