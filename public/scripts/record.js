
var Record = function(fields, data){
    this.fields = fields;
    if(data)
        this.data = data;
    else{
        this.data = {};
    }

}

Record.prototype.processData = function(){
   
    //fix up a few fields from serializeObject
    this.data.born_on_cloud = (this.data.born_on_cloud&&this.data.born_on_cloud=='on')?('true'):('false');

    this.fields.forEach(function(field) {
        if(field.multi){
            if(!this.data[field.name]) this.data[field.name] = [];
            if((typeof this.data[field.name])=='string')         //For multiselect items when only one item is selected it 
                this.data[field.name] = [this.data[field.name]];      //comes back as a string make it an array with one item
        }
        //Handle 'required' fields
        if(field.required){
            console.log('Field \'' + field.name +'\' is required.');
            //Remove any empty values
            if(this.data[field.name]&&(this.data[field.name]==''||this.data[field.name]=='-1'))
                delete this.data[field.name];
            
            if(!this.data[field.name]){  //See if the field exists
                if(field.getDefaultValue){  //See if we can get a default value
                    var val = field.getDefaultValue();
                    this.data[field.name] = val;
                }else{
                    console.log('Warning: Required field \'' + field.name + '\' is missing and has no default value.');
                }
            }
        }
    });
    return data;
}