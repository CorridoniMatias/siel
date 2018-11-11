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

        if(error) return;

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

        if(error) return;

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

        if(error) return;

        cantDecimales = parseInt($("#cantDecimales").val());

        if(isNaN(cantDecimales))
        {
            alert("La cantidad de decimales debe ser un número entero!");
            return;
        } else
        {
            $("#cantDecimales").val(cantDecimales);
        }

        cotaError = parseFloat($("#cotaError").val());

        if(isNaN(cotaError))
        {
            alert("La cota de error debe ser un número!");
            return;
        }

        let decimales = cotaError.countDecimals();
        if(cantDecimales <= decimales)
        {
            alert("La cota de error elegida tiene " + decimales + " decimales, mientras que usted eligió una precisión decimal de " + cantDecimales + " dígitos. Al ser este último mayor es muy probable que nunca se llegue a una solución!")
        }


        console.log("Matriz coeficientes partida: ");
        console.log( splitMatrix(matrixCoeficientes) );

        let normasDom = $("#normas td");

        normasDom[0].innerText = normas.matrices.norma1(matrixCoeficientes);
        normasDom[1].innerText = normas.matrices.norma2(matrixCoeficientes);
        normasDom[2].innerText = normas.matrices.normaInfinito(matrixCoeficientes);

        normasDom[3].innerHTML = formatearErrorDominante( validarMatrixDiagonalmenteDominante(matrixCoeficientes) );

        normasDom[4].innerHTML = formatearErrorDominante( validarMatrixEstrictamenteDominante(matrixCoeficientes) );



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

        head.append("<th>Norma 1</th>")
            .append("<th>Norma 2</th>")
            .append("<th>Norma Infinito</th>");



        console.log("Norma 1: " + normas.matrices.norma1(matrixCoeficientes));

        console.log("Norma inf: " + normas.matrices.normaInfinito(matrixCoeficientes));

        console.log("Norma 2: " + normas.matrices.norma2(matrixCoeficientes));


        console.log("Diagonal dominante:");
        console.log(validarMatrixDiagonalmenteDominante(matrixCoeficientes));
        console.log("Diagonal estricta dominante:");
        console.log(validarMatrixEstrictamenteDominante(matrixCoeficientes));

        let split = splitMatrix(matrixCoeficientes);

        console.log("Jacobi: matriz T");
        console.log(metodos.jacobi.matrizT(split.diagonal, split.triangularInferior, split.triangularSuperior));
        console.log("Jacobi: matriz C");
        console.log(metodos.jacobi.matrizC(split.diagonal, null, terminosIndependientes ));
        console.log("Gauss: matriz T");
        console.log( metodos.gauss.matrizT(split.diagonal, split.triangularInferior, split.triangularSuperior));
        console.log("Gauss: matriz C");
        console.log( metodos.gauss.matrizC(split.diagonal,split.triangularInferior,terminosIndependientes));

        console.log("Resolucion por Jacobi: vector inicial = [1,1,1]");

        console.log( iterar(metodos.jacobi, matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, [2,3,Infinity], (i, vectorActual, cortes) => {

            let builder = "<tr><td>" + i + "</td>";

            $.each(vectorActual, function (j,e) {
                builder += "<td>" + e[0] + "</td>";
            });

            $.each(cortes, function (j,e) {

                builder += "<td>" + ((e.cortar) ? "Cortar" : "Continuar") + "</td>";

                //$("body").append("<br /> Iteracion: " + i + " Norma: " + e.norma + ". Valor: " + e.valor + ". Cortar: " + e.cortar);
            });
            builder += "</tr>";

            body.append(builder);
        }));

        console.log("Resolucion por Gauss: vector inicial = [1,1,1]");
        console.log( iterar(metodos.gauss, matrixCoeficientes, terminosIndependientes, vectorInicial, cotaError, [2,3,Infinity], (i, vectorActual, cortes) => {
            //console.log( cortes )
        }));


    });
});

function formatearErrorDominante(resultado)
{
    if(resultado.status)
        return "<span class='text-success'>Si</span>";
    else
        return "<span class='text-danger'>No. Fila erronea: " + (resultado.faulty+1 + "</span>");
}

var cantEcuaciones = 3;
var cantDecimales = 2;

//Funciones

var vectorInicial = [];
var matrixCoeficientes = [
	[20,2,3],
	[1,5,3],
	[5,9,15]
];

var terminosIndependientes = [
	[1],
	[2],
	[3]
];

var normas = 
{
	matrices:
	{
		norma1: function(matrix)
		{
			//Sumar por cada columna en valor absoluto los valores y quedarse con el mayor de cada uno.
			let tmp = [];

			for(let i = 0; i < matrix.length;i++)
				for(let j = 0; j < matrix[i].length;j++)
				{
					if(typeof tmp[j] === "undefined")
						tmp[j] = 0;

                    tmp[j] += Math.abs(matrix[i][j]);
				}

			return Math.max(...tmp);
		},
		normaInfinito: function(matrix)
		{
			//sumar por cada fila en valor absoluto los valores y quedarse con el mayor de cada uno
            let tmp = [];

            for(let i = 0; i < matrix.length;i++)
                for(let j = 0; j < matrix[i].length;j++)
                {
                    if(typeof tmp[j] === "undefined")
                        tmp[j] = 0;

                    tmp[i] += Math.abs(matrix[i][j]);
                }

            return Math.max(...tmp);
		},
		norma2: function(matrix)
		{

			//la transpuesta de la matrix de coeficientes por la matrix de coeficientes y de ahi sacar el mayor en modulo de los autovalores y despues la raiz cuadrada del autovalor.

            let transpuesta = math.transpose(matrix);

            console.log(transpuesta);

            let crosseada = math.multiply(transpuesta, matrix);

            let autovalores = numeric.eig(crosseada).lambda.x;

            autovalores.map(v => Math.abs(v));

            return Math.sqrt( Math.max(...autovalores) );
		}
	},
	vectores:
	{
		norma2: function(vector)
		{
			// raiz cuadrada de la suma de los elementos del vector al cuadrado
			return this.normap(vector, 2);
		},
		normaInfinito: function(vector)
		{
			// mayor de los modulos de los elementos

            let mapped = vector.map(el => Math.abs(el));

            return Math.max(...mapped);
		},
		normap(vector, p)
		{
			//raiz p-esima de la suma de los elementos del vector en modulo a la p

            if(p == Infinity)
                return this.normaInfinito(vector);

            let newvector = vector.map(v => Math.abs(v)).map(v => Math.pow(v, p));

            let suma = newvector.reduce((acumulado, valorActual) => acumulado + valorActual);

            return math.nthRoot(suma, p);
		}
	}
};

function validarMatrixDiagonalmenteDominante(matrix)
{
	//el modulo de cada elemento de la diagonal tiene que ser mayor o igual que la suma de los demas elementos de la misma fila sumados en modulo.

	return validarMatriz(matrix, (valorDiagonal, sumaNoDiagonal) => valorDiagonal >= sumaNoDiagonal);
}

function validarMatrixEstrictamenteDominante(matrix)
{
	return validarMatriz(matrix, (valorDiagonal, sumaNoDiagonal) => valorDiagonal > sumaNoDiagonal);
}

function validarMatriz(matrix, comparador)
{
    let noDiagonal = 0, diagonal = 0;

    for(let i = 0; i < matrix.length;i++)
    {
        for(let j = 0; j < matrix[i].length;j++)
        {
            if(i != j)
                noDiagonal += Math.abs(matrix[i][j]);
            else
                diagonal = matrix[i][j];
        }

        if(!comparador(diagonal, noDiagonal)){
            return {status:false, faulty: i};
        }

        diagonal = noDiagonal = 0;
    }

    return {status: true};
}

function splitMatrix(matrix)
{
    let diagonal = new Array(matrix.length), triangularSuperior = new Array(matrix.length), triangularInferior = new Array(matrix.length);

    for(let i = 0; i < matrix.length;i++) {

    	diagonal[i] = new Array(matrix[i].length);
        triangularSuperior[i] = new Array(matrix[i].length);
        triangularInferior[i] = new Array(matrix[i].length);

        for (let j = 0; j < matrix[i].length; j++) {
            if(i == j) {
                diagonal[i][j] = matrix[i][j];
                triangularInferior[i][j] = 0;
                triangularSuperior[i][j] = 0;
            } else if(j > i)
            {
                diagonal[i][j] = 0;
                triangularInferior[i][j] = 0;
                triangularSuperior[i][j] = -matrix[i][j];
            } else
            {
                diagonal[i][j] = 0;
                triangularInferior[i][j] = -matrix[i][j];
                triangularSuperior[i][j] = 0;
            }
        }
    }

    return {diagonal:diagonal, triangularSuperior: triangularSuperior, triangularInferior: triangularInferior};
}

var metodos = 
{
	jacobi:
	{
		matrizT: function(diagonal, triangularInferior, triangularSuperior)
		{
			return math.multiply( math.inv(diagonal), math.add(triangularInferior, triangularSuperior));
		},
		matrizC: function(diagonal, triangularInferior, terminosIndependientes)
		{
			return math.multiply( math.inv(diagonal), terminosIndependientes );
		}
	},
	gauss:
	{
		matrizT: function(diagonal, triangularInferior, triangularSuperior)
		{
			return this.multiply(diagonal, triangularInferior, triangularSuperior);
		},
		matrizC: function(diagonal, triangularInferior, terminosIndependientes)
		{
            return this.multiply(diagonal, triangularInferior, terminosIndependientes);
		},
		invDiagonalInferior: function(diagonal, triangularInferior)
		{
			return math.inv( math.subtract(diagonal, triangularInferior) );
		},
		multiply:function(diagonal, triangularInferior, multiply)
		{
            return math.multiply( this.invDiagonalInferior(diagonal, triangularInferior) , multiply);
		}
	}
};



function jacobi()
{
	//Hay que armar 3 matrices: 1 con los elementos de la diagonal, 1 con triangular inferior y otra con la triangular superior
	//Con las 3 obtenidas calculo las matrices T y C
	
	//Para  Jacobi la matriz T es la inversa de la martiz diagonal por la suma de las dos triangulares
	//Pra Jaboci la matriz C es la inversa de la diagonal por la de terminos independientes
	
	//para gauss la matriz T es la inversa de (la diagonal menos la inferior) por la superior
	// para c es igual pero en vez de multiplicar por la superior, mutiplico por la de terminos independientes.
}

async function iterar(metodo, matrizCoeficientes, vectorTerminosIndependientes, vectorInicial, cotaError, normasDeCorte, onIteration)
{
    let vectorActual = [], vectorAnterior = vectorInicial;

    for(let i = 0; i < vectorInicial.length;i++)
    {
        vectorActual[i] = [0];
    }

    let split = splitMatrix(matrizCoeficientes);

    let norma = Infinity;
    let normasint = [];
    let normasReturn = [];

    let iteraciones = 1;
    while(true)
    {
        vectorActual = math.map(math.add( math.multiply(metodo.matrizT(split.diagonal, split.triangularInferior, split.triangularSuperior), vectorAnterior),
            metodo.matrizC(split.diagonal, split.triangularInferior, vectorTerminosIndependientes)), (e) => e.toFixed(cantDecimales));

        for(let i = 0; i < normasDeCorte.length;i++)
        {
            //normasint[i] = parseFloat(normas.vectores.normap( math.subtract(vectorAnterior, vectorActual) , normasDeCorte[i]).toFixed(cantDecimales));

            normasint[i] = parseFloat(normas.vectores.normap( math.subtract(vectorAnterior, vectorActual) , normasDeCorte[i]).toFixed(cantDecimales));

            normasReturn[i] = {norma: normasDeCorte[i], valor: normasint[i], cortar:normasint[i] < cotaError };
        }

        onIteration(iteraciones, vectorActual, normasReturn);

        if(normasint.every(e => {console.log(e + " < " + cotaError); return e < cotaError;}))
            break;

        for(let i = 0; i < vectorAnterior.length;i++)
        {
            vectorAnterior[i][0] = vectorActual[i][0];
        }

        iteraciones++;

        if(iteraciones > 100)
            break;
    }

    return vectorActual;

}

Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
};

//tienen que haber dos vectores el actual y el anterior. (en realidad son matrices columnas xd)
//el anterior empieza siendo el vector inicial y el actual es la matrix T por el vector anterior mas la matriz C (es matriz columna)
//lo anterior es for y un if y corta cuando la norma del vector anterior menos el actual es menor a la cota de error. kmo c para xd?



