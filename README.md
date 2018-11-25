## PxJS 
Es una libreria para facilitar el uso de la programacion funcional , permitiendo crear secuencias de funciones reaprovechables.

Cada secuencia se ejecuta de manera sincrona , y se pueden combinar entre ellas para crear un código mas reutilizable.

Funcionalidades

- El output de cada funcion es el input de la siguiente.
- las funciones reciben siempre dos parametros El input del dato a tratar y opcionalmente Next para trabajar con callbacks. ( Next solo esta disponible si se habilita con enableNext, entonces cuando no se devuelve nada se espera a que se invoke a next)
- Las funciones pueden devolver el ouput, una promesa, un observador, una funcion async o enviar el input en el parametro next.
- Si una funcion devuelve una instancia de Error o vacio( null o undefined) se para la ejecución y se envia al catch.
- Te puedes subscribir a cada secuencia para obtener el resultado.
