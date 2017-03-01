    $(document).ready(function(){
        var from,to,subject,text;
        $("#send_email").click(function(){      
            to=$("#to").val(); 
            user=$("#username").val();     
            $("#message").text("Enviando Email... porfavor espere.");
            $.get("http://efarms.io:8080/send",{to:to,user:user},function(data){ //Change ip addresss to localhost if is necesary
            if(data=="sent")
            {
                alert("Email enviado a: "+to+" porfavor, verifique su bandeja de correo o spam.");
                document.formulario1.submit();
            }

            });
        });

      $.ajax({
      url: "/usReg",
      type: 'GET',
      success: function (result) {
         if(result==0){
              $('#datos').html("No hay registros");
            }else{
              drawTable(result);
            }
             
        //$('#datos').html(json);
        //alert("Exito");
      },
      error: function (result) {
          $('#datos').html("No hay registros");
      }
  });

    function drawTable(data) {
       for (var i = 0; i <= data.length; i++) {
         drawRow(data[i]);
         // $('.footable').footable();
        }
   }

      function drawRow(rowData) {

        var Estado; if (rowData.verified==1) { Estado = 'Activo'; } else { Estado = 'Inactivo'; }
        
        var row = $("<tr class='gradeU'>")
        $('.personDataTable').append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
        row.append($("<td>" + rowData.user_id + "</td>"));
        row.append($("<td>" +"<img src='"+rowData.user_imagen+"' height='80' width='80'>"+ "</td>"));
        row.append($("<td>" + rowData.firstname + "</td>"));
        row.append($("<td>" + rowData.lastname + "</td>"));
        row.append($("<td>" + rowData.user_name + "</td>"));
        row.append($("<td>" + rowData.user_email + "</td>"));
        row.append($("<td>" + Estado + "</td>"));
        row.append($("<td>" +"<a onclick='photoUs("+ rowData.user_id +")' class='widget-icon'><i class='fa fa-camera text-navy'></i></a>"+" &nbsp; "+"<a onclick='editar("+ rowData.user_id +")' class='widget-icon'><i class='fa fa-edit text-navy'></i></a>"+" &nbsp; "+"<a class='widget-icon' id='Opcion2' href=/delVet/"+rowData.idVeterinario+"><i class='fa fa-trash text-navy'></i></a>"+ "</td>"));
        row.append($("</tr>"));

      }
    });

      function editar(data) {
         $('#modalUser').modal();
         $.ajax({
             url: "/editUs/" + data + "",
             type: "GET",
             success: function (result) {
                 $('#usID').val(result[0].user_id);
                 $('#usFN').val(result[0].firstname);
                 $('#usLN').val(result[0].lastname);
                 $('#usNam').val(result[0].user_name);
                 $('#usEM').val(result[0].user_email);
                 $('#usS').val(result[0].Status);
             }, error: function (result) {

             }

         });            
     }

     function photoUs(data){
      $('#foto').modal();
      $.ajax({
             url: "/editUS/" + data + "",
             type: "GET",
             success: function (result) {
                // $('#foto').val(result[0].idVeterinario);
                 //$('#foto').attr('name', + result[0].idVeterinario);
                  form = $('#foto');
                  fields = form.find("input[name^='archivo']");
                  fields.attr('name', result[0].user_id);
             }, error: function (result) {

             }
         });  
     }


    function compare(){
        to=$("#to").val();
        $.get("http://efarms.io:8080/comparar",{to:to},function(data){ //Change ip addresss to localhost if is necesary
            if(data=="registred")
            {
                $("#message1").empty().html("<p> Este email ya esta en uso.</p>");
                $('#send_email').attr("disabled", true);
            }else{
                $("#message1").empty().html("");
                $('#send_email').attr("disabled", false);
            }
        });
    }

        function compareUsuario(){
        to=$("#username").val();
        $.get("http://efarms.io:8080/compararUsuario",{to:to},function(data){ //Change ip addresss to localhost if is necesary
            if(data=="registred")
            {
                $("#message2").empty().html("<p> Este email ya esta en uso.</p>");
                $('#send_email').attr("disabled", true);
            }else{
                $("#message2").empty().html("");
                $('#send_email').attr("disabled", false);
            }
        });


        var d = new Date();
        var fecha = d.getFullYear() +"/"+ d.getMonth() +"/"+ d.getDay();
        $("#date").html(fecha);
        //document.write('Fecha: '+d.getDate(),'<br>Dia de la semana: '+d.getDay(),'<br>Mes (0 al 11): '+d.getMonth(),'<br>Año: '+d.getFullYear(),'<br>Hora: '+d.getHours(),'<br>Hora UTC: '+d.getUTCHours(),'<br>Minutos: '+d.getMinutes(),'<br>Segundos: '+d.getSeconds());


    }