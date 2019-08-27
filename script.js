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
 

   $('.fixed-action-btn').floatingActionButton({

        toolbarEnabled: true
    
    });
  
    /* 
    
        ////WRITE TASKS TO PAGE////

    */

    function populate(){

        //clear div first
        $('#target').html(' ')
         
        //session counter so that tasks stay in order while displayed
        counter = 1;

        //get all data from fb one time
        ref.once("value").then(function(data) { 
                
            dispTaskNum = data.numChildren();            

            //built in snapshot function
            data.forEach((child) =>{

                //generate a random number                
                imgCounter = getRandom(4);

                //write the HTML
                $('#target').append('<div class="card horizontal cardtainer" id="cardtainer'+ child.key +'"></div>')
 
                $('#cardtainer' + child.key).append('<div class="card-image"><img src="icon' + imgCounter + '.png" class="icon" id="'+ counter +'"></div>');
 
                $('#cardtainer' + child.key).append('<div class="card-stacked"><div class="card-content" id="content' + child.key + '"><span>'+ counter +'.0</span> : <span>'+ child.val().name+'</span><hr><p>' + child.val().desc + '</p></div>');
 
                $('#content' + child.key).append('<div class="card-action act"><i class="material-icons small up" id="complete' + child.key +'">done</i><i class="material-icons small down" id="delete' + child.key +'">clear</i><i class="material-icons small star" id="star' + child.key +'">star_border</i></div></div></div>');      
        
                //iterate the session counter
                counter++;
                
                //display a good status in the popout menu status section

                $('#emoji').html('&#x1F44D;');

            })

            })//end DB Call
        }//end populate func
    
 
   /* 

    ////PUSH TASKS TO DB////

   */

   function writeDB(tn,td){
    
        //push taskName and task Description to the db
        ref.push().set({
            
            name: tn,
            desc: td,
            star: 'n'
        
        });

        //repopulate the page
        populate();
        
        //display status
        M.toast({html: 'Task Written: ' + tn, classes: 'customToast', displayLength: '1500'})
    
    }

   /*

       ////FAVORITE A CARD////
   */

    function fav(x){
        //check if icon is open
        if( $('#star' + x).html() == 'star_border'){

            //replace icon with filled in
            $('#star' + x).html('star');

            //update the db entry to indicate starred
            ref.child(x).update({

                star: 'y'                   
            
            });
        
            //notify user
            M.toast({html: 'Favorite Added', classes: 'customToast', displayLength: '1500'})
        
        //check if icon is closed...
        }else if($('#star' + x).html() == 'star'){

            $('#star' + x).html('star_border');
            ref.child(x).update({

                star: 'n'
            
            });
            
            M.toast({html: 'Favorite Removed', classes: 'customToast', displayLength: '1500'})

        }

    }
   
   /*

       ////LISTENERS////
   
   */

   //add task on Floating action button toolbar FABT
    $('#addTask').on('click', function(){
        
        writeDB();
    
    })

    //delete button
    $('#target').on('click', '[id^=delete]', function() {   

        //get the unique id (used by FB) of the card to delete
        toDel = this.id.slice(6);
        
        //remove entry in DB
        firebase.database().ref('batman/' + toDel).remove();
        M.toast({html: 'Task Removed', classes: 'customToast', displayLength: '1500'})

        //repopulate the page
        populate();
    });


    //change icon pics on click
    //set listener on static parent with selector as second arg
    $('#target').on('click', '.icon', function() { 
 
        //get a new random number. arg is number of available images
        newRand = getRandom(8)
    
        //use the id of the clicked element as a selector, change the src attribute to a new path with a random file identifier
        $('#' + this.id).attr('src', 'icon' + newRand + '.png')
        
    });


    //click on star to toggle between filled and empty outline, change status to 'y' in db. Will eventually pin to top / manually select as 'random task'
    $('#target').on('click','.star', function(){

        fav(this.id.slice(4));
        console.log(this.id.slice(4))

    })

    //Click on check will set card as completed
    $('#target').on('click','.up', function(){
      
        if($('#cardtainer' + this.id.slice(8)).hasClass('completed')){
            M.toast({html: 'Task Already Completed', classes: 'customToast', displayLength: '1500'})
    }else{
        //add CSS class to clicked card container
        $('#cardtainer' + this.id.slice(8)).addClass('completed');
        M.toast({html: 'Completed', classes: 'customToast', displayLength: '1500'})
        $('#' + this.id).html('refresh')
        }
    })
    

    //Submit a task
    $('#subTask').click(function(){

        taskName = $('#name').val();
        taskDesc = $('#desc').val();
        if(!taskName || !taskDesc || taskName == ' ' || taskDesc == ' ' || taskDesc == undefined || taskName == undefined){
        
            M.toast({html: 'Error: No Data Submitted', classes: 'customToast', displayLength: '1500'})


        }else{
            //test write with params
            // writeDB('Default Task Name', 'Task Descriptions Can Get Very Long So They Should Hopefully Wrap')
            
            //REMOVE FOR PRODUCTION
            writeDB(taskName, taskDesc);


        }
    })


    $('#randTask').click(function(){

        //number of tasks displayed
        console.log(dispTaskNum);
    
        //check if no tasks are displayed
        if (dispTaskNum == 0){
    
            M.toast({html: 'Error: No Posts Displayed', classes: 'customToast', displayLength: '1500'})

        }
        //get a random number with number of possible tasks as ceiling
        newRand = getRandom(dispTaskNum)
        console.log(newRand + ' should be less than ^^ ');

        let q = document.getElementById('target').getElementsByClassName('cardtainer')[newRand];

        //call only first part of favorite on randomly selected card
        $('#star' + q.id.slice(10)).html('star');
        ref.child(q.id.slice(10)).update({

            star: 'y'

        });



    })
    /*
        ////RANDOM FUNCS////
        
    */

    //return a random number with arg as limit
    function getRandom(x){


        return Math.floor((Math.random()*x));

    }

    //initialize the list upon reload
    populate();
    


 });//end doc ready