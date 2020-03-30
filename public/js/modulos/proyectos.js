import Swal from 'sweetalert2';
import axios from 'axios';

const btnEliminar = document.querySelector('#eliminar-proyecto');

if (btnEliminar) {
    btnEliminar.addEventListener('click', e => {
        const urlProyecto =  e.target.dataset.proyectoUrl;
        
        // console.log(urlProyecto);
        Swal.fire({
            title: 'Quieres eliminar este proyecto',
            text: "Un proyecto eliminado no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'No, cancelar'
          }).then((result) => {
            if (result.value) {
                // Enviar resultado con axios
                const url = `${location.origin}/proyectos/${urlProyecto}`;

                axios.delete(url, { params: {urlProyecto}})
                    .then( res => {
                        console.log(res);

                        Swal.fire(
                            'Proyecto Eliminado',
                            res.data,
                            'success'
                        );
                      //Redireccionar al inicio
                      setTimeout(() => {
                          window.location.href = '/'
                      }, 2000);
                    } )
                    .catch(() => {
                        Swal.fire({
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'No se pudo eliminar el proyecto'
                        })
                    })

                    return;

                
            }
          })
    })
}

export default btnEliminar;