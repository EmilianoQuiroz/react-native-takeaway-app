import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FirebaseContext } from "../../firebase";
import { useNavigate } from "react-router-dom"; 
import FileUploader from 'react-firebase-file-uploader';


const NuevoPlato = () => {

  // UseState para las imagenes
  const [subiendo, guardarSubiendo] = useState(false);
  const [progreso, guardarProgreso] = useState(0);
  const [urlimagen, guardarUrlimagen] = useState('');

  // Context con las operaciones de firebase
  const { firebase } = useContext(FirebaseContext);

  // console.log(firebase);

  // Hook para redireccionar
  const navigate = useNavigate();
 
  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      nombre: "",
      precio: "",
      categoria: "",
      imagen: "",
      descripcion: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(3, "Los nombres deben tener almenos 3 caracteres")
        .required("El Nombre del plato es obligotario"),
      precio: Yup.number()
        .min(1, "Agrega el precio de tu producto")
        .required("El Precio del plato es obligotario"),
      categoria: Yup.string().required(
        "La Categoría del plato es obligotaria"
      ),
      descripcion: Yup.string()
        .min(10, "La descripción debe ser más larga")
        .required("La descripción es obligatoria"),
    }),
    onSubmit: async (datos) => {
      try {
        // le mando la colección donde debe crearse y el cuerpo como objeto
        const res = await firebase.insertDocument("productos", { ...datos });
        
        // en caso recibo un id quiere decir que se insertó
        if (res.id) {
          console.log("insercción de cuerpo correcta:", res.id);
        }
        datos.imagen = urlimagen;
        // Redireccionar a menu
        navigate('/menu');

      } catch (error) {
        console.log(error);
      }
    },
  });

  // Todo sobre las imagenes
  const handleUploadStart = () => {
    guardarProgreso(0);
    guardarSubiendo(true);
  }
  const handleUploadError = () => {
    guardarSubiendo(false);
  }
  const handleUploadSuccess = async nombre => {
    guardarProgreso(100);
    guardarSubiendo(false);

    // Almacenamiento de la URL de destino
    const url = await firebase
            .storage
            .ref("productos")
            .child(nombre)
            .getDownloadURL();
    console.log(url);
    guardarUrlimagen(url);
  }
  const handleUploadProgress = progreso => {
    guardarProgreso(progreso);
    console.log(progreso);
  }
  return (
    <>
      <h1 className="text-3xl font-light mb-4">Agregar Plato</h1>

      <div className="flex justify-center mt-10">
        <div className="max-w-3xl w-full">
          <form
            onSubmit={formik.handleSubmit}
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="nombre"
              >
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlined"
                placeholder="Nombre del plato"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            { formik.touched.nombre && formik.errors.nombre ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Hubo un error:</p>
                <p>{formik.errors.nombre}</p>
              </div>
            ) : null }

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="precio"
              >
                Precio
              </label>
              <input
                type="number"
                id="precio"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlined"
                placeholder="Precio del plato"
                min="0"
                value={formik.values.precio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              { formik.touched.precio && formik.errors.precio ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Hubo un error:</p>
                <p>{formik.errors.precio}</p>
              </div>
            ) : null }

            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="precio"
              >
                Categoria
              </label>
              <select
                id="precio"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlined"
                name="categoria"
                value={formik.values.categoria}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">--- Seleccine ---</option>
                <option value="desayuno">"Desayuno"</option>
                <option value="almuerzo">"Almuerzo"</option>
                <option value="cena">"Cena"</option>
                <option value="bebidas">"Bebidas"</option>
                <option value="postre">"Postre"</option>
                <option value="ensalada">"Ensalada"</option>
              </select>
            </div>
            { formik.touched.categoria && formik.errors.categoria ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Hubo un error:</p>
                <p>{formik.errors.categoria}</p>
              </div>
            ) : null }

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="imagen"
              >
                Imagen
              </label>
              <FileUploader 
                accept="image/*"
                id="imagen"
                name="imagen"
                randomizeFilename
                storageRef={firebase.storage.ref("productos")}
                onUploadStart={handleUploadStart}
                onUploadError={handleUploadError}
                onUploadSuccess={handleUploadSuccess}
                onProgress={handleUploadProgress}
              />
            </div>
              { subiendo && (
                  <div className="h-12 relative w-full border">
                    <div className="bg-green-500 absolute left-0 top-0 text-white px2 text-sm h-12 flex items-center" style={{ width:`${progreso}%`}}>{progreso}%</div>
                  </div>
              ) }
              {urlimagen && (

                <p className="bg-green-500 text-white p-3 text-center my-5">
                  La imagen se subio correctamente
                </p>
              )}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="descripcion"
              >
                Descripcion
              </label>
              <textarea
                type="text"
                id="descripcion"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlined h-40"
                placeholder="Descripcion del plato"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              ></textarea>
            </div>
            { formik.touched.descripcion && formik.errors.descripcion ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Hubo un error:</p>
                <p>{formik.errors.descripcion}</p>
              </div>
            ) : null }

            <input
              type="submit"
              className="bg-blue-900 hover:bg-blue-800 w-full mt-5 p-2 text-white uppercase font-bold rounded-md"
              value="Agregar Plato"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default NuevoPlato;
