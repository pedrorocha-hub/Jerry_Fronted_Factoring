import React from 'react';
import RibEeffForm from './RibEeffForm';

/**
 * Esta página sirve como un punto de entrada dedicado desde la sección de Dossiers
 * al formulario de gestión de RIB EEFF. Renderiza directamente el RibEeffForm,
 * que maneja su propia lógica basándose en los parámetros de la URL.
 */
const RibEEFFSectionsPage = () => {
  return <RibEeffForm />;
};

export default RibEEFFSectionsPage;