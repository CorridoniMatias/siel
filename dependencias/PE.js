$(document).ready(function () {

	console.log(normas.matrices.norma1());

    console.log(normas.matrices.normaInfinito());

    console.log(normas.matrices.norma2());

    let vec = [
    	[1],
		[-20],
		[3]
	];

    console.log(normas.vectores.normap(vec, 3));
});

//Funciones

var vectorInicial = [];
var matrixCoeficientes = [
	[1,2,3],
	[1,5,3],
	[5,9,2]
];

var normas = 
{
	matrices:
	{
		norma1: function()
		{
			//Sumar por cada columna en valor absoluto los valores y quedarse con el mayor de cada uno.
			let tmp = [];

			for(let i = 0; i < matrixCoeficientes.length;i++)
				for(let j = 0; j < matrixCoeficientes[i].length;j++)
				{
					if(typeof tmp[j] === "undefined")
						tmp[j] = 0;

                    tmp[j] += Math.abs(matrixCoeficientes[i][j]);
				}

			return Math.max(...tmp);
		},
		normaInfinito: function()
		{
			//sumar por cada fila en valor absoluto los valores y quedarse con el mayor de cada uno
            let tmp = [];

            for(let i = 0; i < matrixCoeficientes.length;i++)
                for(let j = 0; j < matrixCoeficientes[i].length;j++)
                {
                    if(typeof tmp[j] === "undefined")
                        tmp[j] = 0;

                    tmp[i] += Math.abs(matrixCoeficientes[i][j]);
                }

            return Math.max(...tmp);
		},
		norma2: function()
		{

			//la transpuesta de la matrix de coeficientes por la matrix de coeficientes y de ahi sacar el mayor en modulo de los autovalores y despues la raiz cuadrada del autovalor.

            let transpuesta = math.transpose(matrixCoeficientes);

            console.log(transpuesta);

            let crosseada = math.multiply(transpuesta, matrixCoeficientes);

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

            let newvector = vector.map(v => Math.abs(v)).map(v => Math.pow(v, p));

            let suma = newvector.reduce((acumulado, valorActual) => acumulado + valorActual);

            return math.nthRoot(suma, p);
		}
	}
};

function validarMatrixDiagonalmenteDominante()
{
	//el modulo de cada elemento de la diagonal tiene que ser mayor o igual que la suma de los demas elementos de la misma fila sumados en modulo.

    let tmp = 0, diagonal = 0;

    for(let i = 0; i < matrixCoeficientes.length;i++)
    {
        for(let j = 0; j < matrixCoeficientes[i].length;j++)
        {
            if(i+1 != j)
                tmp += Math.abs(matrixCoeficientes[i][j]);
            else
                diagonal = matrixCoeficientes[i][j];

            console.log("[" + i + "][" + j + "] = " + matrixCoeficientes[i][j]);
        }

        if(diagonal < tmp){

        }
    }
}

function validarMatrixEstrictamenteDominante()
{
	//igual pero solo mayor
}

var metodos = 
{
	jacobi:
	{
		matrizT: function()
		{
		},
		matrizC: function()
		{
		}
	},
	gauss:
	{
		matrizT: function()
		{
		},
		matrizC: function()
		{
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

//tienen que haber dos vectores el actual y el anterior. (en realidad son matrices columnas xd)
//el anterior empieza siendo el vector inicial y el actual es la matrix T por el vector anterior mas la matriz C (es matriz columna)
//lo anterior es for y un if y corta cuando la norma del vector anterior menos el actual es menor a la cota de error. kmo c para xd?



