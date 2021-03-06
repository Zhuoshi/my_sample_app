/* TODO:
 I need to add buttons for adding and deleting tasks.
 I need to add error checking to the fields.
 */
Ext.Loader.setConfig({
    enabled:true
});

//Let the loader know where to look for this example module.  Use the CDN for speed

Ext.Loader.setPath('Ext.ux', 'http://cdn.sencha.io/ext-4.1.1-gpl/examples/ux');
//Ext.Loader.setPath('Ext.example', 'http://cdn.sencha.io/ext-4.1.1-gpl/examples');


//To reduce load times, only bring in the portions of Ext that we actually need

Ext.require([
    'Ext.layout.container.*',
    'Ext.tab.*',
    'Ext.grid.*',
    'Ext.form.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*',
    'Ext.form.*',
    'Ext.ux.RowExpander',
    'Ext.selection.CellModel',
    'Ext.button.*'
]);

//Execute the code in the following function when the page is ready.
Ext.onReady(function () {



    //define a local namespace, so we don't pollute the global namespace.  We don't use all locals because we
    //may want to recycle this app later.
    Ext.namespace("taskMaster");

    try {
        taskMaster.csrfToken = Ext.select("meta[name='csrf-token']").elements[0].getAttribute('content');

        // Ensure the Rails CSRF token is always sent
        Ext.Ajax.on('beforerequest', function (o, r) {
            r.headers = Ext.apply({
                'Accept':'application/json',
                'X-CSRF-Token':taskMaster.csrfToken
            }, r.headers || {});
        });
    } catch (e) {
        // console.log('CSRF protection appears to be disabled');
    }

    //register a new model with ExtJs
    Ext.define('taskModel', {
        extend:'Ext.data.Model',
        fields:[
            {name:'id', type:'int', useNull:true},
            {name:'Name', type:'string'},
            {name:'Description', type:'string'},
            {name:'Priority', type:'string'},
            {name:'DateStarted', type:'string'},
            {name:'TimeStarted', type:'string'},
            {name:'DateDue', type:'string'},
            {name:'Status', type:'string'}
        ]
    });

    // Some sample data to populate our table
    var myData = [
        [1, 'Learn Javascript', 'I need to read, Javascript, the Good Parts', 'high' , '', '', '', '' ]
    ];


    //Ext is a MVC framework for single page web apps.   It has the concept of data stores.   There can
    //be multiple views on the data...
    var store = Ext.create('Ext.data.Store', {
            model:'taskModel',
            idProperty: 'id',
            //data: myData,
            autoLoad:true,
            autoSync:true,
            proxy:{
                type:'rest',
                //batchActions: false,
                url:'tasks', //rest_api',
                reader:{
                    type:'json',
                    root:'response.data' ,
                    successProperty: "success"
                },
                writer:{
                    type:'json'
                }
            },
            listeners:{

                read:function (store, operation) {
                    console.log('reading');
                    console.log(store)      ;
//                    var record = operation.getRecords()[0],
//                        name = Ext.String.capitalize(operation.action),
//                        verb;
                },
                write:function (store, operation) {
                    var record = operation.getRecords()[0],
                        name = Ext.String.capitalize(operation.action),
                        verb;
                    if (name == 'Destroy') {
                        record = operation.records[0];
                        verb = 'Destroyed';
                    }
                    else if (name=='Create'){
                            record=operation.records[0];
                            //record.set('id',record.data.id)
                            //record.internalId=record.data.id
                            verb='Created'
                        }
                    else {
                        verb = name + 'd';
                    }
                }
            }
        }
    );

    // for now, we'll edit our grid one cell at a time.  Later, we may experiment with row editing.
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit:1
    });

    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        //clicksToEdit: 1
    })

    //Let's setup the properties for our columns
    //dataIndex points to the field in our store that we will actually take data from.
    var gridColumns = [];

    gridColumns.push({header:'Id', width:120, sortable:true, dataIndex:'id', editor:{
        xtype:'numberfield', hidden:true,
        allowBlank:true}});

    gridColumns.push({header:'Name', width:120, sortable:true, dataIndex:'Name', editor:{
        xtype:'textfield',
        allowBlank:false}});
    // here I include a hidden property just to remind myself that it is possible to hide columns.   For example,
    // for this app, we might imagine storing a taskID with the primary key in the database.

    gridColumns.push({header:'Description', width:120, hidden:false, sortable:true, dataIndex:'Description', editor:{
        xtype:'textfield',
        allowBlank:false}});

    //Here, we add a combobox editor
    gridColumns.push({header:'Priority', width:120, hidden:false, sortable:true, dataIndex:'Priority', editor:new Ext.form.field.ComboBox({
        typeAhead:true,
        triggerAction:'all',
        selectOnTab:true,
        store:[
            ['High', 'High'],
            ['Medium', 'Medium'],
            ['Low', 'Low']
        ]
    })});

    gridColumns.push({header:'Start Date', width:120, sortable:true, dataIndex:'DateStarted', editor:{
        xtype:'datefield',
        allowBlank:true,
        renderer:Ext.util.Format.dateRenderer('m d Y')
        //format: 'm d Y'
    }});

    // Here, the time field actually will display a datetime rather than a time, so I use a renderer
    // to show things in the proper format.

    taskMaster.timefieldRenderer = function (format) {
        return function (v) {
            if (v instanceof Date) {
                return v.format(format);
            } else {
                return v;
            }
        };
    };
    gridColumns.push({header:'Start Time', width:120, sortable:true, dataIndex:'TimeStarted', editor:{
        xtype:'timefield',
        increment:30,
        minValue:'6:00 AM',
        maxValue:'8:00 PM',
        format:'g:i A',
        renderer:Ext.util.Format.dateRenderer('g:i A'),
        allowBlank:true
    }});
    gridColumns.push({header:'Due Date', width:120, sortable:true, dataIndex:'DateDue', editor:{
        xtype:'datefield',
        allowBlank:true
    }});
    gridColumns.push({header:'Status', width:120, hidden:false, sortable:true, dataIndex:'Status', editor:new Ext.form.field.ComboBox({
        typeAhead:true,
        triggerAction:'all',
        selectOnTab:true,
        allowBlank:true,
        store:[
            ['0', '0'],
            ['0.25', '25%'],
            ['0.5', '50%'],
            ['0.75', '75%'],
            ['1.00', 'Done']
        ]
    })});


    /*GridPanel that displays the data*/
    taskMaster.grid = new Ext.grid.GridPanel({
        store:store,
        columns:gridColumns,

        stripeRows:true,
        height:350,
        width:950,
//        selType: 'rowmodel',
//        plugins: [
//            Ext.create('Ext.grid.plugin.RowEditing', {
//                clicksToEdit: 1
//            })
//        ],
        plugins:[rowEditing],
        title:'Task Master',
        collapsible:false,
        animCollapse:false,
        dockedItems:[
            {
                xtype:'toolbar',
                items:[
                    {
                        text:'Add',
                        icon:'/static/img/silk/add.png',
                        handler:function () {
                            // empty record
                            var currnum = taskMaster.grid.store.data.items.length
                            //store.insert(0, new taskModel({id: currnum+1}));
                            store.insert(0, new taskModel({Name:'New Task', Description:'Describe Your Task Here'}));
                            //taskMaster.grid.store.data.items[0].id = currnum + 1
                            //store.data.items[0].phantom=false;
                            //store.save();
                            //rowEditing.startEdit(0, 0);
                            //taskMaster.grid.getView.refresh();
                        }
                    },
                    '-',
                    {
                        itemId:'delete',
                        text:'Delete',
                        icon:'/static/img/silk/delete.png',
                        disabled:true,
                        handler:function () {
                            var selection = taskMaster.grid.getView().getSelectionModel().getSelection()[0];
                            if (selection) {
                                store.remove(selection);
                            }
                        }
                    }
                ]
            }
        ]

    });

    taskMaster.grid.columns[0].setVisible(false);

    taskMaster.grid.getSelectionModel().on('selectionchange', function (selModel, selections) {
        taskMaster.grid.down('#delete').setDisabled(selections.length === 0);
    });

    var button = new Ext.Button({applyTo:'button-div', text:'Submit!', minWidth:130, handler:taskMaster.submitHandler});
    var conn = new Ext.data.Connection();


    //if our message to the server is successful, we will wish to take actions....
    taskMaster.successFunction = function (response) {
        var idealdata = Ext.decode(response);
    }


    //how to get data over to the server

    taskMaster.submitHandler = function (button, event) {


        params = {};  //setup our datastructure to send over the wire.  Make it an object in case we generalize later
        params.tasks = [];
        for (var i = 0; i < taskMaster.grid.store.data.items.length; i++) {
            var title = taskMaster.grid.store.data.items[i].data.Title;
            var description = taskMaster.grid.store.data.items[i].data.Description;
            var dateStarted = taskMaster.grid.store.data.items[i].data.DateStarted;
            var timeStarted = taskMaster.grid.store.data.items[i].data.TimeStarted;
            var dateDue = taskMaster.grid.store.data.items[i].data.DateDue;
            var status = taskMaster.grid.store.data.items[i].data.Status;


            params.tasks.push({
                title:title,
                description:description,
                dateStarted:dateStarted,
                dateDue:DateDue,
                status:status
            });
        }
        ;

        //serialize the data in JSON format for transfer to the server.
        var data = Ext.JSON.encode(params);
        $.ajax({
            url:'tasks', //'/rest_api',
            type:'POST',
            data:{'data':data},
            success:function (response) {
                taskMaster.successFunction(response);
            }
        });
    }

    //Put our button and grid in a panel--simple layout for now....
    taskMaster.taskPanel = new Ext.Panel({
        layout:'table',
        width:1100,
        layoutConfig:{
            columns:2
        },
        items:[taskMaster.grid, button]
    });


    //put everything in a tabpanel and then render it
    var myTabs = new Ext.TabPanel({
        resizeTabs:true, // turn on tab resizing
        minTabWidth:115,
        tabWidth:135,
        enableTabScroll:true,
        width:1150,
        height:765,
        activeItem:'taskMasterTab', //Making the calculator tab selected first
        defaults:{autoScroll:true},
        items:[
            {
                title:'Task Master',
                id:'taskMasterTab',
                iconCls:'/static/img/silk/calculator.png',
                items:[taskMaster.taskPanel]
            },
            {
                title:'Help Manual',
                id:'helpmanualtab',
                padding:5,
                iconCls:'/static/img/silk/help.png',
                html:'<h1>Hi</h1>'

            }
        ]
    });

    myTabs.render('tabs');
});
