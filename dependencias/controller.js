$(document).ready(function () {

    //Controller

    $("div.actions>button").click(function () {
        let coefs = $("#coficientes");

        if($(this).attr("data-action") == "add")
        {
            cantEcuaciones++;

            //agregamos matriz coeficientes
            coefs.find("thead>tr").append("<th>" + cantEcuaciones + "</th>");

            let body = coefs.find("tbody");

            let clon = body.find("tr:nth-child(1)").clone();
            clon.find("td:nth-child(1)").text(cantEcuaciones);
            clon.find("input").removeClass("error").val("");
            body.append(clon);

            body.find("tr").append("<td><input type='number' /></td>")

            //agregamos vector incognita

            $("tbody#incognitas").append("<tr><td>X" + cantEcuaciones + "</td></tr>");

            //agregamos vector termino independiente
            $("tbody#terminosIndependientes").append("<tr> <td><input type='number' /></td> </tr>");


            //vector inicial
            $(".vectorInicial tr").append("<td><input type='number' /></td>");

        } else if($(this).attr("data-action") == "remove")
        {
            if(cantEcuaciones == 2)
                return;

            //agregamos matriz coeficientes
            coefs.find("thead>tr>th:last-child").detach();

            let body = coefs.find("tbody");

            body.find("tr:last-child").detach();
            body.find("tr>td:last-child").detach();

            //agregamos vector incognita

            $("tbody#incognitas>tr:last-child").detach();

            $("tbody#terminosIndependientes>tr:last-child").detach();

            $(".vectorInicial tr>td:last-child").detach();

            cantEcuaciones--;
        }
    });


    $("[data-action='calcular']").click(function () {

        $("#resultadoFinal").addClass("hidden");

        let matrixCoeficientes = [];
        let terminosIndependientes = [];
        let cotaError = 0;
        let vectorInicial = [];
        let error = false;

        //obtenemos la matrix de coeficientes
        let coeficientes = $("#coficientes tbody>tr");
        let i = 0, col = 0;

        matrixCoeficientes[0] = new Array(coeficientes.length);

        let inputs = coeficientes.find("input");

        inputs.each(function (j, e) {

            matrixCoeficientes[i][col] = parseFloat(e.value);

            if(isNaN(matrixCoeficientes[i][col]))
            {
                $(e).addClass("error");
                error = true;
                return false;
            } else
            {
                $(e).removeClass("error");
            }

            col++;
            if(j == 0)
                return true;

            if(j == inputs.length - 1)
                return false;

            if((j+1) % coeficientes.length  == 0)
            {
                i++;
                col = 0;
                matrixCoeficientes[i] = new Array(coeficientes.length);
            }
        });

        if(error) {
            swal({
                title: "Complete todos los cámpos",
                text: "Complete los campos que fueron pintados en rojo para continuar.",
                icon: "error",
                button: "Ok",
            });

            return;
        }

        $("#terminosIndependientes input").each(function (i,e) {
            terminosIndependientes[i] = [];
            terminosIndependientes[i][0] = parseFloat(e.value);

            if(isNaN(terminosIndependientes[i][0]))
            {
                $(e).addClass("error");
                error = true;
                return false;
            } else
            {
                $(e).removeClass("error");
            }
        });

        if(error) {
            swal({
                title: "Complete todos los cámpos",
                text: "Complete los campos que fueron pintados en rojo para continuar.",
                icon: "error",
                button: "Ok",
            });

            return;
        }

        $(".vectorInicial input").each(function (i,e) {
            vectorInicial[i] = [];
            vectorInicial[i][0] = parseFloat(e.value);

            if(isNaN(vectorInicial[i][0]))
            {
                $(e).addClass("error");
                error = true;
                return false;
            } else
            {
                $(e).removeClass("error");
            }
        });

        if(error) {
            swal({
                title: "Complete todos los cámpos",
                text: "Complete los campos que fueron pintados en rojo para continuar.",
                icon: "error",
                button: "Ok",
            });

            return;
        }

        cantDecimales = parseInt($("#cantDecimales").val());

        if(isNaN(cantDecimales) || cantDecimales < 1)
        {
            //alert("La cantidad de decimales debe ser un número entero y positivo!");

            swal({
                title: "Cámpos inválidos",
                text: "La cantidad de decimales debe ser un número entero y positivo!",
                icon: "error",
                button: "Ok",
            });

            return;
        } else
        {
            $("#cantDecimales").val(cantDecimales);
        }

        cotaError = parseFloat($("#cotaError").val());

        if(isNaN(cotaError) || cotaError < 0 || cotaError > 1)
        {
            //alert("La cota de error debe ser un número!");

            swal({
                title: "Cámpos inválidos",
                text: "La cota de error debe ser un número entre 0 y 1!",
                icon: "error",
                button: "Ok",
            });

            return;
        }

        let decimales = cotaError.countDecimals();
        if(cantDecimales <= decimales)
        {
            alert("La cota de error elegida tiene " + decimales + " decimales, mientras que usted eligió una precisión decimal de " + cantDecimales + " dígitos. Al ser este último mayor es muy probable que nunca se llegue a una condición de corte válida!")
        }


        console.log("Matriz coeficientes partida: ");
        console.log( splitMatrix(matrixCoeficientes) );

        let normasDom = $("#normas td");

        normasDom[0].innerText = normas.matrices.norma1(matrixCoeficientes);
        normasDom[1].innerText = normas.matrices.norma2(matrixCoeficientes);
        normasDom[2].innerText = normas.matrices.normaInfinito(matrixCoeficientes);

        let diagonalmenteDominante = validarMatrixDiagonalmenteDominante(matrixCoeficientes);
        let estrictamenteDominante = validarMatrixEstrictamenteDominante(matrixCoeficientes);

        $(normasDom[3]).replaceWith(formatearErrorDominante( diagonalmenteDominante ));

        $(normasDom[4]).replaceWith(formatearErrorDominante( estrictamenteDominante ));

        $("#panel-coeficientes").removeClass("hidden");
        $("html, body").animate({ scrollTop: $("#panel-coeficientes").offset().top }, "slow");

        let metodo;

        if($('[name="metodo"]:checked').val() != "gauss")
            metodo = metodos.jacobi;
        else
            metodo = metodos.gauss;

        if(!diagonalmenteDominante.status)
        {
            swal({
                title: "Advertencia!",
                text: "La matriz de coeficientes ingresada no es Diagonalmente Dominante, debido a esto no se puede garantizar la convergencia de los métodos de resolución. Verifique la sección 'Datos de la Matriz de Coeficientes' para ver qué fila es la que no cumple con la condición. Desea continuar igual?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                buttons: ["Cambiar matriz", "Calcular de todos modos"]
            })
                .then((continuar) => {
                    if (continuar) {
                        calcular(matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, metodo);
                    }
                });
        } else
            calcular(matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, metodo);

    });

    $('[data-action="volver"]').click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    $('[data-action="limpiar"]').click(function () {
        $("input[type='number']:not(#cantDecimales)").val("");
        $("#panel-resolucion").addClass("hidden");
        $("#panel-coeficientes").addClass("hidden");
    });
});

function calcular(matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, metodo)
{
    $("#metodoElegido").text(" por el método de " + metodo.nombre);
    $("#panel-resolucion").removeClass("hidden");

    let sistema = $("#sistema");

    let body = sistema.find("tbody");

    body.html("");

    let head = sistema.find("thead>tr:last-child");
    head.html("")
        .append("<th>Iteraci&oacute;n</th>");

    for(let i = 1; i <= cantEcuaciones; i++)
    {
        head.append("<th>X" + i + "</th>");
    }

    sistema.find("#thVariables").attr("colspan", cantEcuaciones + 1);

    head.append("<th class='doubleborderleft'>Norma 2</th>")
        .append("<th>Norma 3</th>")
        .append("<th>Norma Infinito</th>");


    /*
    console.log("Norma 1: " + normas.matrices.norma1(matrixCoeficientes));

    console.log("Norma inf: " + normas.matrices.normaInfinito(matrixCoeficientes));

    console.log("Norma 2: " + normas.matrices.norma2(matrixCoeficientes));


    console.log("Diagonal dominante:");
    console.log(validarMatrixDiagonalmenteDominante(matrixCoeficientes));
    console.log("Diagonal estricta dominante:");
    console.log(validarMatrixEstrictamenteDominante(matrixCoeficientes));
    */
    let split = splitMatrix(matrixCoeficientes);
    /*
    console.log("Jacobi: matriz T");
    console.log(metodos.jacobi.matrizT(split.diagonal, split.triangularInferior, split.triangularSuperior));
    console.log("Jacobi: matriz C");
    console.log(metodos.jacobi.matrizC(split.diagonal, null, terminosIndependientes ));
    console.log("Gauss: matriz T");
    console.log( metodos.gauss.matrizT(split.diagonal, split.triangularInferior, split.triangularSuperior));
    console.log("Gauss: matriz C");
    console.log( metodos.gauss.matrizC(split.diagonal,split.triangularInferior,terminosIndependientes));

    console.log("Resolucion por Jacobi: vector inicial = " + vectorInicial);*/
    let converge = false;
    let border;
    let ultimoResultado;
    try {


        converge = iterar(metodo, matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, [2, 3, Infinity], (i, vectorActual, cortes) => {

            let builder = "<tr><td>" + i + "</td>";

            $.each(vectorActual, function (j, e) {
                builder += "<td>" + e[0] + "</td>";
            });

            $.each(cortes, function (j, e) {

                if(j == 0)
                    border =  "class='doubleborderleft'";
                else
                    border = "";

                builder += "<td " + border + "><span style='text-decoration: underline;' data-toggle='tooltip' data-placement='bottom' data-original-title='" + e.valor + " < " + cotaError + " = " + e.cortar + "'>" + ((e.cortar) ? "Cortar" : "Continuar") + "</span></td>";

            });
            builder += "</tr>";

            body.append(builder);
            ultimoResultado = vectorActual;
        });

    } catch(err)
    {
        converge = false;
    }

    $('[data-toggle="tooltip"]').tooltip();

    if(!converge)
    {
        swal({
            title: "Error al calcular",
            text: "El cálculo llegó al máximo de iteraciones posibles sin encontrar un resultado. Intente cambiar la cota de error, la cantidad de decimales de precisión y/o verifique que la Matriz de Coeficientes sea Diagonalmente Dominante.",
            icon: "error",
            button: "Ok",
        });
        body.find("tr:last-child").addClass("btn-danger");
    } else
    {
        body.find("tr:last-child").addClass("btn-success");
        let nEc = 0;

        let rp = $("#resultadoFinal p");
        rp.html("");

        for(let i = 0;i < ultimoResultado.length;i++)
        {
            rp.append("X" + (i+1) + " = " + ultimoResultado[i][0] + "<br />");
        }

        $("#resultadoFinal").removeClass("hidden");
    }

    $("html, body").animate({ scrollTop: $(document).height() }, "slow");
}

function formatearErrorDominante(resultado)
{
    if(resultado.status)
        return "<td class='text-success'><span>Si</span></td>";
    else
        return "<td class='btn-danger'><span>No. Fila erronea: " + (resultado.faulty+1 + "</span></td>");
}