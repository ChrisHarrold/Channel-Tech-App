var fields =  [
    { //create_ts
        name : 'create_ts',
        type: 'text',
        label: 'Created timestamp',
        placeholder: 'Created timestamp',
        required: true,
        readonly:true,
        hidden:true,
        getDefaultValue: function(itm){
            var date = new Date();
            return date.getFullYear() * 10000000000000 + (date.getMonth()+1)*100000000000 + date.getDate()+1000000000+date.getHours() * 10000000 + date.getMinutes()*100000+date.getSeconds()*1000+date.getMilliseconds();
        },
        getDisplayValue: function(itm){
            return this.getValue(itm);
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(this.getDefaultValue()):(itm[this.name]);
        }
    },
    { //create date
        name : 'create_date',
        type: 'text',
        label: 'Created',
        placeholder: 'Created',
        required: true,
        readonly:true,
        getDefaultValue: function(itm){
            return new Date().toDateString();
        },
        getDisplayValue: function(itm){
            //initially stored as Day Mon DD YYYY
            //                    Mon Jan 01 1970
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var val = this.getValue(itm);
            var vals = val.split(' ');
            if(vals.length==4){
                var _val = '';
                var day = vals[0];
                var mon = vals[1];
                var monnum = $.inArray(mon, months) + 1;
                var d = vals[2]*1;
                var year = vals[3];
                _val = monnum+"/"+d+"/"+(year-2000);
                return _val;
            } else {
                return val;
            }
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(this.getDefaultValue()):(itm[this.name]);
        }
    },      
    { //Company
        name : 'company_name',
        type: 'text',
        label: 'Company',
        placeholder: 'Company',
        required: true,
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //city
        name : 'city',
        type: 'text',
        label: 'City',
        placeholder: 'City',
        required: true,
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //state
        name : 'state',
        type: 'text',
        label: 'State',
        placeholder: 'State',
        required: true,
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //country
        name : 'country',
        type: 'text',
        label: 'Country',
        placeholder: 'Country',
        required: true,
        default: 'US',
        getDefaultValue: function(){
            return this.default;
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(this.getDefaultValue()):(itm[this.name]);
        },
        options: [
            'US',
            'Canada',
            'WW'
        ]       
    },
    { //region
        name : 'region',
        type: 'text',
        label: 'Region',
        placeholder: 'Region',
        required: true,
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        },
        options: [
            'East',
            'West',
            'WW',
            'Canada',
            'Carribean'
        ]        
    },
    { //status
        name : 'status',
        type: 'text',
        label: 'Status',
        placeholder: 'Status',
        default: 'Active',
        required: true,
        getDefaultValue: function(){
            return this.default;
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //source
        name : 'source',
        type: 'text',
        label: 'Source',
        placeholder: 'Source',
        required: true,
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        },
        options: [
            'ESA Team',
            'Briggs Hunters',
            'Xavier Hunters',
            'Jayne Hunters',
            'WW',
            'Digital',
            'MSP/CSP',
            'xBrand'
        ]    
    },   
    { //source rep
        name : 'source_rep',
        type: 'text',
        label: 'Source Rep',
        placeholder: 'Source',
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //sales rep
        name : 'esa_sales_rep',
        type: 'text',
        label: 'ESA Sales Rep',
        placeholder: 'Sales Rep',
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //track
        name : 'track',
        type: 'checkbox',
        multi: true,
        label: 'Track',
        placeholder:'Track',
        tooltip: '',
        required: false,
        getDefaultValue: function(){
            return [];
        },
        options :[
            'Big Data',
            'Databases',
            'Reporting',
            'Predictive Analytics',
            'Content Management',
            'Decision Optimization',
            'Watson',
            'Watson Analytics' 
        ],
        getValue: function(itm){
            return ((!itm || itm[this.name]==undefined)?([]):(itm[this.name]));
        },
        getDisplayValue: function(itm){
            var val = this.getValue(itm);
            if(typeof val == 'string')
                val = [val];
            //console.log(val);
            return val.join(', ');
        }
    },
    { //esa tech
        name : 'esa_tech',
        type: 'text',
        label: 'ESA Tech Rep',
        placeholder: 'ESA Tech Rep',
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //notes
        name : 'notes',
        type: 'text',
        label: 'Notes',
        placeholder: 'Notes',
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        }
    },
    { //sales process state
        name : 'sales_process_state',
        type: 'text',
        label: 'State',
        placeholder: 'State',
        required: true,
        default: 'Qualification',
        getDefaultValue: function(){
            return this.default;
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(''):(itm[this.name]);
        },
        options: ['Qualification' ]
    },
    { //born on cloud
        name : 'born_on_cloud',
        type: 'boolean',
        label: 'Born on cloud',
        placeholder: 'Born on cloud',
        required: true,
        default: true,
        getDefaultValue: function(){
            return this.default;
        },
        getValue: function(itm){
            return (!itm || itm[this.name]==undefined)?(this.getDefaultValue()):(itm[this.name]);
        }
    }
];