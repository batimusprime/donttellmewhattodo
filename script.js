//Fire JQuery on doc load
$(document).ready(function(){
    
    /*
    
        ////VARIABLE DECLARATION////
    
    */
    // this will be provided by oAuth later
    let userId = 'batman'
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

    //Initialize Materialize JS
    M.AutoInit();
 
    //turn the FAB into a toolbar
    $('.fixed-action-btn').floatingActionButton({

        toolbarEnabled: true
    
    });
  
    /* 

        ////POPULATE////
        ////WRITE TASKS TO PAGE////

    */

    function populate(){

        //get all data from fb one time
        ref.once("value").then(function(data) { 
                
            parseData(data, 'all');

        })//end DB Call


    }//end populate func
    

    /* 
    
        ////PARSE DATA////
    
    */
    function parseData(data, option){

        //session counter so that tasks are always numbered 1-10 on the page
        counter = 1;

        //clear div first
        $('#target').html(' ')

        // //number of tasks in list
        dispTaskNum = data.numChildren();   
             
        
        //built in snapshot function iterate over children
        data.forEach((child) =>{
        
        //generate a random number to display random images (8 available)                
        imgCounter = getRandom(8);
        
        imgName = child.val().name;
        imgDesc = child.val().desc;
        
        childKey = child.key  
        //check DB for star status
        if (child.val().star == 0){
           
            //set star to filled in version
            starVar = 'star'
            // if (option == 'stars'){}   
            
            }else{
        
                //outlined version
                starVar = 'star_border';
         
            }
            writeHTML(childKey, imgName, imgDesc, imgCounter, counter, starVar);
            
            //Then increase the count
            counter++; 

        });
      
    }
    /* 
    
        ////WRITE HTML TO PAGE////
    
    */

    function writeHTML(cKey,imgN, imgD, imgC, count, starVar){
        //write the HTML
        $('#target').append('<div class="card horizontal cardtainer" id="cardtainer'+ cKey +'"></div>')

        $('#cardtainer' + cKey).append('<div class="card-image"><img src="icon' + imgCounter + '.png" class="icon" id="'+ imgC +'"></div>');

        $('#cardtainer' + cKey).append('<div class="card-stacked"><div class="card-content" id="content' + cKey + '"><span>'+ count +'.0</span> : <span>'+ imgN + '</span><hr><p>' + imgD + '</p></div>');

        $('#content' + cKey).append('<div class="card-action act"><i class="material-icons small up" id="complete' + cKey +'">done</i><i class="material-icons small down" id="delete' + cKey +'">clear</i><i class="material-icons small star" id="star' + cKey +'">' + starVar + '</i></div></div></div>');      

    }


   /* 

        ////PUSH TASKS TO DB////

   */

   function writeDB(tn,td){
    
        //push taskName and task Description to the db
        ref.push().set({
            
            name: tn,
            desc: td,
            star: 1
        
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

        //check if task is completed first

        if($('#cardtainer'+x).hasClass('completed')){
            
            //display toast
            M.toast({html: 'Task Already completed!', classes: 'customToast', displayLength: '1500'})
        
        }else{
            //check if icon is open
            if( $('#star' + x).html() == 'star_border'){

                //replace icon with filled in
                $('#star' + x).html('star');

                //update the db entry to indicate starred
                ref.child(x).update({

                    star: 0                   
                
                });
            
                //notify user
                M.toast({html: 'Favorite Added', classes: 'customToast', displayLength: '1500'})
            
            //check if icon is closed...
            }else if($('#star' + x).html() == 'star'){

                $('#star' + x).html('star_border');
                ref.child(x).update({

                    star: 1
                
                });
                
                M.toast({html: 'Favorite Removed', classes: 'customToast', displayLength: '1500'})

            }

        }
    }

    /*
    
        ////GET A RANDOM CARD////
        
    */

    function randCard(x){
        
        //get a random number with number of possible tasks as ceiling
        newRand = getRandom(x);
        
        //get all cardtainers in target parent, iterate through them by random generated number newRand
        let allCards = document.getElementById('target').getElementsByClassName('cardtainer')[newRand];
        //return FB UID sliced out of selected ID
        return allCards.id.slice(10);

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

    })

    //Click on check will set card as completed
    $('#target').on('click','.up', function(){
      
        if($('#cardtainer' + this.id.slice(8)).hasClass('completed')){
            
            M.toast({html: 'Task Already Completed', classes: 'customToast', displayLength: '1500'})
        
        }else{
        
            //add CSS class to clicked card container
            $('#cardtainer' + this.id.slice(8)).addClass('completed');
            $('#delete' + this.id.slice(8)).addClass('selectMe');
            
            M.toast({html: 'Completed', classes: 'customToast', displayLength: '1500'})

        //mark in database
        ref.child(this.id.slice(8)).update({

            complete: 'y'
        
        });

        $('#complete' + this.id.slice(8)).html('tag_faces');
        }
    })
    

    //Submit a task
    $('#subTask').click(function(){

        taskName = $('#name').val();
        taskDesc = $('#desc').val();
        //UNCOMMENT FOR DEV - test write with params
        // writeDB('Default Task Name', 'Task Descriptions Can Get Very Long So They Should Hopefully Wrap')
        if(!taskName || !taskDesc || taskName == ' ' || taskDesc == ' ' || taskDesc == undefined || taskName == undefined){
        
            M.toast({html: 'Error: No Data Submitted', classes: 'customToast', displayLength: '1500'})


        }else{

            
            //UNCOMMENT FOR PRODUCTION
            writeDB(taskName, taskDesc);


        }
    })

    //favorite a random task, change to filled in star icon
    $('#randTask').click(function(){
    
        //check if no tasks are displayed
        if (dispTaskNum == 0){
    
            M.toast({html: 'Error: No Posts Displayed', classes: 'customToast', displayLength: '1500'})

        }else{

            //returns FB UID
            let randId = randCard(dispTaskNum);     
                
            if ($('#star' + randId).html() == 'star_border'){
                
                //call only first part of favorite on randomly selected card
                //this is done so that getting a random card doesn't 'unstar' a task that it finds
                $('#star' + randId).html('star');

                //update the DB
                ref.child(randId).update({

                    star: 0

                });

            }else{
                //this has to re-run the operation
                console.log('already starred');

            }
        }
    
    })

    //display only starred posts
    $('#dispStar').click(function(){

        console.log('only stars');
        //repopulate the list with favorites at the top
        var starsRef = firebase.database().ref('batman/').orderByChild('star');
        starsRef.once('value').then(function(snap){

            parseData(snap, 'stars');

        })

    });
    /*
        ////RANDOMIZATION FUNCS////
        
    */

    //return a random number with arg as limit
    function getRandom(x){


        return Math.floor((Math.random()*x));

    }

    //initialize the list upon reload
    populate();
    


 });//end doc ready