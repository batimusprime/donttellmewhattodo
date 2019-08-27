//Fire JQuery on doc load
$(document).ready(function(){
    
    /*
    
        ////VARIABLE DECLARATION////
    
    */
    // this will be provided by oAuth later
    let userId = 'batman'
    let taskCount = 0;
    let status = 'down';
    let counter;
    let iter = 0;
    let imgCounter;
    
    // Configure firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBDIJlVedfXtUIwC1tqUxLkwBV4KpwgFeM",
        authDomain: "dont-tell-me-what-to-do.firebaseapp.com",
        databaseURL: "https://dont-tell-me-what-to-do.firebaseio.com",
        projectId: "dont-tell-me-what-to-do",
        storageBucket: "dont-tell-me-what-to-do.appspot.com",
        messagingSenderId: "1065510586990",
        appId: "1:1065510586990:web:6dce28d74d3d3cf0"
      };
    
    //Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Get a database reference
    const db = firebase.database();
    const ref = db.ref(userId);

    /*

        ////PAGE OPERATIONS////

    */

   M.AutoInit();

   $('.sidenav').sidenav();
   let elem = document.getElementById('slide-out');
   let instance = M.Sidenav.getInstance(elem);
   
   
   //auto open menu
   // instance.open();
   $('#burger').click(function(){
   
    instance.open();
   
   
   })
   
   $('#close').click(function(){
   
    instance.close();
   
   })

    /* 
    
        ////WRITE TASKS TO PAGE////

    */
    function populate(){

        //clear div first
        $('#target').html(' ')
         
        //session counter so that tasks stay in order while displayed
        counter = 1;
        //child added is for getting lists, it is recursive, value is not
        ref.once("value").then(function(data) { 
                
            $('#emoji').html('SAD');


            //built in snapshot function
            data.forEach((child) =>{

                //generate a random number                
                imgCounter = Math.floor((Math.random()*4));
                console.log('Random: ' + imgCounter)

                //write the HTML
                $('#target').append('<div class="card horizontal cardtainer" id="cardtainer'+ child.key +'"></div>')
 
                $('#cardtainer' + child.key).append('<div class="card-image"><img src="icon' + imgCounter + '.png" class="icon" id="'+ counter +'"></div>');
 
                $('#cardtainer' + child.key).append('<div class="card-stacked"><div class="card-content" id="content' + child.key + '"><span>'+ counter +'.0</span> : <span>'+ child.val().name+'</span><hr><p>' + child.val().desc + '</p></div>');
 
                $('#content' + child.key).append('<div class="card-action act"><i class="material-icons small up" id="complete' + child.key +'">done</i><i class="material-icons small down" id="delete' + child.key +'">clear</i><i></i></div></div></div>');      
        
                //iterate the session counter
                counter++;   
                $('#emoji').html('&#x1F44D;');

            })

            })//end DB Call
        }//end populate func
    
 
   /* 

    ////PUSH TASKS TO DB////

   */

   function writeDB(){

    ref.push().set({
      name: 'Task Name Here' + iter,
      desc: 'I need some unique content' + iter
    });
    
    writtenKey = ref.push().key;
    console.log('Key ' + writtenKey + ' sesison written - ' + iter)
    iter++;
    populate();
    
   }

   /*

       ////LISTENERS////
   
   */

    $('#addTask').on('click', function(){
        
        writeDB();
    
    })

    $('#target').on('click', '[id^=delete]', function() {   

        //get the unique id (used by FB) of the card to delete
        toDel = this.id.slice(6);
        
        //remove entry in DB
        firebase.database().ref('batman/' + toDel).remove();
    
        //repopulate the page
        populate();
    });

    $('#floatPlus').click(function(){

        writeDB();

    })



    /*
        ////RANDOM FUNCS////
        
    */

    //initialize the list upon reload
    populate();

});//end doc ready