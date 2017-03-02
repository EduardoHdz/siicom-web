  $(document).ready(function(){
    $.ajax({
          url: "/infoClients",
          Type: "GET",
          success: function(result){
            for (var i = 0; i <= result.length; i++) {
            $('#idCliente1').append( '<option value="'+result[i].idCliente+'">'+result[i].Nombre+'</option>' );
            $('#idCliente').append( '<option value="'+result[i].idCliente+'">'+result[i].Nombre+'</option>' );
             } 
              }
          });
  });