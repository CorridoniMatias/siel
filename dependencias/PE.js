var MAXIMASITERACIONES = 200; //Cuanto iterar antes de decir que no converge

var cantEcuaciones = 3;
var cantDecimales = 2;


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
                diagonal = Math.abs(matrix[i][j]);
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
		},
        nombre: "Jacobi"
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
		},
        nombre: "Gauss Seidel"
	}
};

//Hay que armar 3 matrices: 1 con los elementos de la diagonal, 1 con triangular inferior y otra con la triangular superior
//Con las 3 obtenidas calculo las matrices T y C

//Para  Jacobi la matriz T es la inversa de la martiz diagonal por la suma de las dos triangulares
//Pra Jaboci la matriz C es la inversa de la diagonal por la de terminos independientes

//para gauss la matriz T es la inversa de (la diagonal menos la inferior) por la superior
// para c es igual pero en vez de multiplicar por la superior, mutiplico por la de terminos independientes.

function iterar(metodo, matrizCoeficientes, vectorTerminosIndependientes, vectorInicial, cotaError, normasDeCorte, onIteration)
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

        if(normasint.every(e => e < cotaError))
            break;

        for(let i = 0; i < vectorAnterior.length;i++)
        {
            vectorAnterior[i][0] = vectorActual[i][0];
        }

        iteraciones++;

        if(iteraciones > MAXIMASITERACIONES)
            return false;
    }

    return true;

}


//Funcion helper para obtener cantidad de decimales
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;

    let decimalPart = this.toString().split(".")[1];

    if(typeof decimalPart === "undefined")
        return this.toString().split("e")[1].substring(1);

    return this.toString().split(".")[1].length || 0;
};
