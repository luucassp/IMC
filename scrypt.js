// caputurar o envio do subimit do formulario

const form = document.querySelector("#form");

     form.addEventListener("submit", function(e){
       
        e.preventDefault(); 
        const inputPeso = e.target.querySelector("#peso")
        const inputAltura = e.target.querySelector("#altura")
        
        const peso = Number(inputPeso.value);

        const altura = Number(inputAltura.value);

        if(!peso){
            setResultado("peso inválido ",false);
            return;
        }
        else if (!altura){
            setResultado("Altura inváida", false);
            return;
        }
         const imc = getIMC(peso, altura)

         const classeImc = getNivelImc(imc)

         const msg = `Seu IMC é ${imc} (${classeImc}).`;
         
            setResultado (msg, true);

        console.log(imc, classeImc)

    });

//  criando função do classe de cada imc :
//  Menos do que 18,8   Abaixo do Peso 
//  Entre 18,5 e 24,9   Peso normal
//  Entre 25 e 29,9     Sobrepeso 
//  Entre 30 e 34,9     Obesidade grau 1  
//  Entre 35 e 39,9     Obesidade grau 2 
//  Mais do que 40      Obesidade grau 3


        function getNivelImc(imc){
            const classe = ["Abaixo do peso ", "peso normal", "Sobrepeso", "obesidede grau 1", "obesidede grau 2", "obesidede grau 3"]

            if (imc >= 39.9) return classe[5];    
            if (imc >= 34.9) return classe[4];
            if (imc >= 29.9) return classe[3];
            if (imc >= 24.9) return classe[2];
            if (imc >= 18.5) return classe[1];
            if ( imc < 18.5) return classe[0];
 };


//criancdio outra funçao para o calculo do imc... 
    function getIMC(peso,altura){
        
        const imc = peso / altura ** 2;
        return imc.toFixed(2);

    }



// crianção do paragrafo da div, pelo JS

    function criaP (){
        const p = document.createElement("p");
        return p;     
       }

    function setResultado (msg, isVlad) {

        const resultado = document.querySelector("#resultado");
        resultado.innerHTML = "";   
        
        const p = criaP();

        if (isVlad) {
            p. classList.add("resultado")
        }
            else {
                p. classList.add("bad")
        }

            
        
        p.innerHTML = msg;
        resultado.appendChild(p);

    
    
    };
     



