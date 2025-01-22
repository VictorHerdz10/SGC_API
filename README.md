# Sistema de Gestión de Registro de Contratos

Este proyecto es una API para gestionar el registro de contratos. Permite realizar operaciones CRUD sobre contratos, usuarios, entidades, direcciones, facturas y respaldos de datos.

## Tabla de Contenidos

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Variables de Entorno](#variables-de-entorno)
- [Contribuyendo](#contribuyendo)
- [Licencia](#licencia)

## Tecnologías Utilizadas

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Dropbox](https://img.shields.io/badge/Dropbox-0061FF?style=for-the-badge&logo=dropbox&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-007BFF?style=for-the-badge&logo=nodemailer&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cron](https://img.shields.io/badge/Cron-000000?style=for-the-badge&logo=cron&logoColor=white)

## Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/VictorHerdz10/SGC_API.git
    cd SGC_API/backend
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Configura las variables de entorno en un archivo [.env](http://_vscodecontentref_/0):
    ```properties
    MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
    JWT_SECRET=tu_clave_secreta
    EMAIL_USER=tu_email@gmail.com
    EMAIL_PASS=tu_contraseña
    EMAIL_HOST=smtp.tu_proveedor_de_email.com
    EMAIL_PORT=587
    FRONTEND_URL=http://localhost:3000
    PORT=4000
    ```

4. Inicia el servidor:
    ```bash
    npm run dev
    ```

## Uso

### Endpoints

- **Usuarios**
  - `POST /api/usuario`: Registrar un nuevo usuario.
  - `POST /api/usuario/login`: Autenticar un usuario.
  - `POST /api/usuario/olvide-password`: Solicitar restablecimiento de contraseña.
  - `GET /api/usuario/olvide-password/:token`: Comprobar token de restablecimiento.
  - `POST /api/usuario/nuevo-password/:token`: Establecer nueva contraseña.
  - `GET /api/usuario/perfil`: Obtener perfil del usuario autenticado.
  - `PUT /api/usuario/actualizar-perfil`: Actualizar perfil del usuario autenticado.
  - `POST /api/usuario/cambiar-password`: Cambiar contraseña del usuario autenticado.
  - `GET /api/usuario/obtener-usuarios`: Obtener todos los usuarios (Admin_Gnl).
  - `DELETE /api/usuario/eliminar-usuario/:id`: Eliminar un usuario (Admin_Gnl).
  - `POST /api/usuario/asignar-rol`: Asignar rol a un usuario (Admin_Gnl).
  - `POST /api/usuario/poner-token`: Establecer token de Dropbox (Admin_Gnl).

- **Contratos**
  - `POST /api/contratos`: Registrar un nuevo contrato.
  - `GET /api/contratos/listar-registro-contratos`: Obtener todos los contratos.
  - `PUT /api/contratos/actualizar-registro-contrato/:id`: Actualizar un contrato.
  - `DELETE /api/contratos/eliminar-registro-contrato/:id`: Eliminar un contrato.
  - `POST /api/contratos/filtrar-contratos`: Filtrar contratos.
  - `GET /api/contratos/notificacion-contratos`: Obtener notificaciones de contratos.
  - `GET /api/contratos/marcar-leida/:id`: Marcar notificación como leída.
  - `GET /api/contratos/marcar-leidas-all`: Marcar todas las notificaciones como leídas.

- **Facturas**
  - `POST /api/facturas/crear-factura`: Crear una nueva factura.
  - `POST /api/facturas/advertencia-monto-crear`: Verificar monto antes de crear factura.
  - `POST /api/facturas/advertencia-monto-modificar`: Verificar monto antes de modificar factura.
  - `POST /api/facturas/visualizar-factura`: Visualizar una factura.
  - `PUT /api/facturas/modificar-factura`: Modificar una factura.
  - `DELETE /api/facturas/eliminar-factura/:contratoId`: Eliminar una factura.

- **Entidades**
  - `POST /api/entidad`: Crear una nueva entidad.
  - `GET /api/entidad/obtener-entidades`: Obtener todas las entidades.
  - `PUT /api/entidad/modificar-entidad/:id`: Modificar una entidad.
  - `DELETE /api/entidad/eliminar-entidad/:id`: Eliminar una entidad.

- **Direcciones**
  - `POST /api/direccion`: Crear una nueva dirección.
  - `GET /api/direccion/obtener-direcciones`: Obtener todas las direcciones.
  - `PUT /api/direccion/modificar-direccion/:id`: Modificar una dirección.
  - `DELETE /api/direccion/eliminar-direccion/:id`: Eliminar una dirección.

- **Backups**
  - `GET /api/backup`: Respaldar datos.
  - `GET /api/backup/obtener-datos-backup`: Obtener datos de respaldo.
  - `POST /api/backup/restore-db`: Restaurar base de datos.
  - `DELETE /api/backup/eliminar-backup/:id`: Eliminar un respaldo.
  - `GET /api/backup/crear-backup-local`: Crear un respaldo local.
  - `POST /api/backup/restaurar-backup-local`: Restaurar un respaldo local.

## Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en tu archivo [.env](http://_vscodecontentref_/1):

```properties
MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
JWT_SECRET=tu_clave_secreta
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña
EMAIL_HOST=smtp.tu_proveedor_de_email.com
EMAIL_PORT=587
FRONTEND_URL=http://localhost:3000
PORT=4000
Contribuyendo
¡Gracias por tu interés en contribuir! Por favor, sigue estos pasos para contribuir al proyecto:

Haz un fork del repositorio.
Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
Realiza tus cambios y haz commit (git commit -m 'Agregar nueva funcionalidad').
Sube tus cambios (git push origin feature/nueva-funcionalidad).
Abre un Pull Request.
Licencia
Este proyecto está licenciado bajo la Licencia ISC.