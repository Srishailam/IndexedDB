$(document).ready(function(){
    


    var request = indexedDB.open('customermanager',1);
    
    request.onupgradeneeded = function(e){
        var db = e.target.result;
        if(!db.objectStoreNames.contains('customers')){
            var os = db.createObjectStore('customers',{keyPath:'id',autoIncrement:true});
            os.createIndex('name','name',{unique:false});
        }
    };
    
    request.onsuccess = function(e){
        console.log('success msg');
        db = e.target.result;
        
        showCustomers(e);
    };
    
    request.onerror = function(e){
        console.log('error msg',e);
    };
    
});

function addCustomer(){
    var cname = $('#cname').val();
    var cemail = $('#cemail').val();
    
    var transaction = db.transaction(['customers'],'readwrite');
    var store = transaction.objectStore('customers');
    var customer = {
        name:cname,
        email:cemail
    };
    
    var request = store.add(customer);
    request.onsuccess = function(e){
       // window.location.href = 'index.html';
        console.log('success',e);
    };
    request.onerror = function(e){
        alert('customer was not added');
        console.log(e.target.error.name);
    };
}

function showCustomers(e){
    var transaction = db.transaction(['customers'],'readonly');
    var store = transaction.objectStore('customers');
    
    var index = store.index('name');
    var output ='';
    index.openCursor().onsuccess = function(e){
        var cursor = e.target.result;
        if(cursor){
            output += "<tr id='customer_"+cursor.value.id+"'>";
            output += '<td>'+cursor.value.id+'<td>';
            output += "<td><span class = 'cursor customer' contenteditable='true' data-field ='name' data-id='"+cursor.value.id+"'>"+cursor.value.name+"</span><td>";
            output += "<td><span class = 'cursor customer' contenteditable='true' data-field ='email' data-id='"+cursor.value.id+"'>"+cursor.value.email+"</span><td>";
            output += "<td><a onclick = 'removeCustomer("+cursor.value.id+")' href=''>Delete</a><td>";
            cursor.continue();
            
        }
        $('#customers').html(output);
    };
    
}
function removeCustomer(){
    var transaction = db.transaction(['customers'],'readwrite');
    var store = transaction.objectStore('customers');
    var request = store.delete(id);
    
    request.onsuccess = function(){
        console.log('customer'+id+'deleted');
        $('#customer_'+id).remove();
    };
    
    request.onerror = function(e){
        alert('customer was not removed');
        console.log(e.target.error.name);
    };
}

function clearCustomers(){
    indexedDB.deleteDatabase('customermanager');
}

$('#customers').on('blur','.customer', function(){
    var newtext = $(this).html();
    var field = $(this).data('field');
    var id = $(this).data('id');
    
    var transaction = db.transaction(['customers'],'readwrite');
    var store = transaction.objectStore('customers');
    var request = store.get(id);
    
    request.onsuccess = function(){
        var data = request.result;
        if(field === 'name'){
            data.name = newtext;
        }else if(field==='email'){
            data.email = newtext;
        }
        
        var requestUpdate = store.put(data);
        requestUpdate.onsuccess = function(){
            console.log('customer updated');  
        };
        requestUpdate.onerror = function(){
            console.log('customer was updated');  
        };

    };
});