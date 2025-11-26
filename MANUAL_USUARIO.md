# Manual de Usuario - Sistema de Gestión de Bar

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestión de Productos](#gestión-de-productos)
5. [Gestión de Sedes y Mesas](#gestión-de-sedes-y-mesas)
6. [Gestión de Usuarios](#gestión-de-usuarios)
7. [Gestión de Pagos y Cierre (Cajero)](#gestión-de-pagos-y-cierre-cajero)
8. [Historial y Consulta de Ventas](#historial-y-consulta-de-ventas)
9. [Reportes](#reportes)
10. [Analíticas](#analíticas)
11. [Configuración de Perfil](#configuración-de-perfil)
12. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 1. Introducción

El **Sistema de Gestión de Bar** es una plataforma web diseñada para administrar todas las operaciones de un establecimiento de bebidas y aperitivos. El sistema permite gestionar productos, órdenes, pagos, usuarios y generar reportes detallados.

### Características Principales

- ✅ **Gestión de Productos**: Catálogo completo de bebidas y aperitivos
- ✅ **Gestión de Sedes y Mesas**: Administración de múltiples ubicaciones
- ✅ **Gestión de Usuarios y Roles**: Control de acceso basado en roles
- ✅ **Gestión de Pagos**: Procesamiento de pagos y cierre de órdenes
- ✅ **Historial de Ventas**: Consulta y análisis de ventas históricas
- ✅ **Reportes**: Generación de reportes detallados
- ✅ **Analíticas**: Visualización de métricas y tendencias

### Roles del Sistema

- **Administrador**: Acceso completo a todas las funcionalidades
- **Cajero**: Gestión de pagos y cierre de órdenes
- **Mesero**: Toma de órdenes y gestión de mesas
- **Barman**: Preparación de bebidas y cócteles

---

## 2. Acceso al Sistema

### 2.1 Iniciar Sesión

1. Abre tu navegador web (Chrome, Firefox, Edge, Safari)
2. Ingresa a la URL del sistema: `http://localhost:8080`
3. Serás redirigido automáticamente a la página de inicio de sesión

### 2.2 Credenciales por Defecto

**Administrador:**
- **Email**: `admin@bar.com`
- **Contraseña**: `Admin@123`

> ⚠️ **Importante**: Cambia la contraseña después del primer acceso por seguridad.

### 2.3 Proceso de Inicio de Sesión

1. Ingresa tu **email** en el campo correspondiente
2. Ingresa tu **contraseña**
3. Haz clic en el botón **"Iniciar Sesión"**
4. Si las credenciales son correctas, serás redirigido al Dashboard

### 2.4 Recuperación de Contraseña

Si olvidaste tu contraseña:
1. Contacta al administrador del sistema
2. El administrador puede restablecer tu contraseña desde la sección de Usuarios

### 2.5 Cerrar Sesión

1. Haz clic en el **avatar de usuario** (círculo dorado) en la esquina superior derecha
2. Selecciona **"Cerrar Sesión"** del menú desplegable
3. Serás redirigido a la página de inicio de sesión

---

## 3. Dashboard Principal

El Dashboard es la pantalla principal que verás después de iniciar sesión. Muestra un resumen general del estado del bar.

### 3.1 Elementos del Dashboard

- **Bienvenida**: Mensaje personalizado con tu nombre
- **Métricas Principales**: Indicadores clave de rendimiento
- **Gráficos**: Visualización de datos importantes
- **Accesos Rápidos**: Enlaces a funcionalidades más usadas

### 3.2 Navegación

- **Menú Lateral**: Acceso a todas las secciones del sistema
- **Header Superior**: Información del usuario y notificaciones
- **Área de Contenido**: Donde se muestran las diferentes secciones

---

## 4. Gestión de Productos

La sección de **Productos** permite administrar el catálogo de bebidas y aperitivos del bar.

### 4.1 Ver Lista de Productos

1. En el menú lateral, haz clic en **"Productos"**
2. Verás una tabla con todos los productos activos
3. La tabla muestra:
   - Código del producto
   - Nombre
   - Categoría
   - Precio
   - Estado (Activo/Inactivo)

### 4.2 Buscar Productos

1. Usa el campo de **búsqueda** en la parte superior
2. Puedes buscar por:
   - Nombre del producto
   - Código
   - Categoría
3. Los resultados se filtran automáticamente mientras escribes

### 4.3 Agregar Nuevo Producto

1. Haz clic en el botón **"Agregar Producto"** (botón verde con icono +)
2. Completa el formulario:
   - **Código**: Identificador único (ej: CER-001)
   - **Nombre**: Nombre del producto (ej: Aguila)
   - **Categoría**: Selecciona de la lista desplegable
   - **Precio**: Precio en pesos colombianos
   - **Estado**: Activo/Inactivo
3. Haz clic en **"Guardar"**

### 4.4 Editar Producto

1. En la lista de productos, haz clic en el botón **"Editar"** (icono de lápiz)
2. Modifica los campos necesarios
3. Haz clic en **"Guardar"** para confirmar los cambios

### 4.5 Desactivar/Activar Producto

1. En la lista de productos, haz clic en el botón **"Desactivar"** o **"Activar"**
2. Confirma la acción en el diálogo que aparece
3. El producto cambiará su estado inmediatamente

> 💡 **Tip**: Los productos desactivados no aparecerán en las opciones al crear órdenes, pero se mantienen en el historial.

---

## 5. Gestión de Sedes y Mesas

Esta sección permite administrar las ubicaciones físicas del bar y sus mesas.

### 5.1 Ver Sedes

1. En el menú lateral, haz clic en **"Sedes"**
2. Verás una lista de todas las sedes registradas
3. Cada sede muestra:
   - Código
   - Nombre
   - Dirección
   - Teléfono
   - Estado

### 5.2 Agregar Nueva Sede

1. Haz clic en **"Agregar Sede"**
2. Completa el formulario:
   - **Código**: Identificador único (ej: SED-001)
   - **Nombre**: Nombre de la sede
   - **Dirección**: Dirección completa
   - **Teléfono**: Número de contacto
3. Haz clic en **"Guardar"**

### 5.3 Gestionar Mesas de una Sede

1. En la lista de sedes, haz clic en **"Ver Mesas"** o **"Gestionar Mesas"**
2. Verás todas las mesas de esa sede
3. Cada mesa muestra:
   - Código de la mesa
   - Número de asientos
   - Estado (Disponible/Ocupada/Reservada)

### 5.4 Agregar Mesa

1. Dentro de la gestión de mesas de una sede, haz clic en **"Agregar Mesa"**
2. Completa:
   - **Código**: Identificador de la mesa (ej: MESA-01)
   - **Número de Asientos**: Capacidad de la mesa
   - **Estado**: Disponible por defecto
3. Haz clic en **"Guardar"**

### 5.5 Cambiar Estado de Mesa

1. En la lista de mesas, haz clic en el botón de **estado**
2. Selecciona el nuevo estado:
   - **Disponible**: Mesa libre para uso
   - **Ocupada**: Mesa en uso
   - **Reservada**: Mesa reservada

---

## 6. Gestión de Usuarios

Esta sección permite administrar los usuarios del sistema y sus roles.

### 6.1 Ver Lista de Usuarios

1. En el menú lateral, haz clic en **"Usuarios"**
2. Verás una tabla con todos los usuarios
3. La tabla muestra:
   - Nombre completo
   - Email
   - Documento
   - Roles asignados
   - Estado (Activo/Inactivo)

### 6.2 Agregar Nuevo Usuario

1. Haz clic en **"Agregar Usuario"**
2. Completa el formulario:
   - **Email**: Correo electrónico (será el usuario de acceso)
   - **Contraseña**: Debe cumplir requisitos de seguridad
   - **Nombre**: Primer nombre
   - **Apellido**: Apellido
   - **Tipo de Documento**: CC, CE, PP, TI, RC
   - **Número de Documento**: Número de identificación
   - **Sede**: Sede asignada (opcional)
   - **Roles**: Selecciona uno o más roles
3. Haz clic en **"Guardar"**

### 6.3 Requisitos de Contraseña

La contraseña debe cumplir:
- Mínimo 8 caracteres
- Al menos una letra mayúscula (A-Z)
- Al menos una letra minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (!@#$%^&*)
- No debe ser una contraseña común

### 6.4 Editar Usuario

1. En la lista de usuarios, haz clic en **"Editar"**
2. Modifica los campos necesarios
3. **Nota**: Para cambiar la contraseña, el administrador debe usar la opción de restablecimiento
4. Haz clic en **"Guardar"**

### 6.5 Asignar Roles

1. Al editar un usuario, en la sección **"Roles"**
2. Marca o desmarca los roles que deseas asignar
3. Los roles disponibles son:
   - **Administrador**: Acceso completo
   - **Cajero**: Gestión de pagos
   - **Mesero**: Toma de órdenes
   - **Barman**: Preparación de bebidas

### 6.6 Desactivar Usuario

1. En la lista de usuarios, haz clic en **"Desactivar"**
2. Confirma la acción
3. El usuario no podrá iniciar sesión, pero sus datos se mantienen

---

## 7. Gestión de Pagos y Cierre (Cajero)

Esta sección está diseñada específicamente para los cajeros y permite procesar pagos y cerrar órdenes.

### 7.1 Ver Órdenes Pendientes

1. En el menú lateral, haz clic en **"Gestión de Pagos"**
2. Verás una lista de órdenes pendientes de pago
3. Cada orden muestra:
   - Número de orden
   - Mesa
   - Total a pagar
   - Estado
   - Fecha de creación

### 7.2 Filtrar Órdenes

Usa los filtros en la parte superior:
- **Por Estado**: Todas, Pendientes, Parcialmente Pagadas, Pagadas
- **Por Mesa**: Selecciona una mesa específica
- **Por Fecha**: Rango de fechas

### 7.3 Procesar Pago

1. En la lista de órdenes, haz clic en **"Procesar Pago"** en la orden deseada
2. Se abrirá un modal con los detalles de la orden:
   - Items de la orden
   - Subtotal
   - IVA (19%)
   - Descuentos (si aplican)
   - **Total a pagar**
   - **Total pagado** (si hay pagos previos)
   - **Pendiente por pagar**

3. En la sección **"Nuevo Pago"**, completa:
   - **Monto**: Cantidad a pagar
   - **Método de Pago**: 
     - Efectivo
     - Tarjeta
     - Transferencia
     - Otro
   - **Número de Referencia**: (Obligatorio para tarjeta/transferencia)
   - **Notas**: (Opcional)

4. Haz clic en **"Agregar Pago"**
5. El pago se agregará a la lista de pagos realizados

### 7.4 Múltiples Pagos

Puedes procesar múltiples pagos para una misma orden:
- Ejemplo: Cliente paga parte en efectivo y parte con tarjeta
- Cada pago se registra por separado
- El sistema calcula automáticamente el saldo pendiente

### 7.5 Cerrar Orden

Una orden se puede cerrar cuando:
- El total pagado es igual o mayor al total a pagar
- Todos los pagos están completos

**Proceso:**
1. Asegúrate de que todos los pagos estén procesados
2. Haz clic en **"Cerrar Orden"**
3. Confirma la acción
4. La orden cambiará a estado "Cerrada"
5. La mesa se liberará automáticamente

### 7.6 Ver Detalles de Orden

1. Haz clic en **"Ver Detalles"** en cualquier orden
2. Verás información completa:
   - Items ordenados con cantidades y precios
   - Historial de pagos realizados
   - Información del mesero
   - Fechas y horas

### 7.7 Anular Pago

Si necesitas anular un pago:
1. Contacta al administrador
2. Solo los administradores pueden anular pagos por seguridad

---

## 8. Historial y Consulta de Ventas

Esta sección permite consultar todas las ventas realizadas y generar reportes históricos.

### 8.1 Acceder al Historial

1. En el menú lateral, haz clic en **"Historial de Ventas"**
2. Verás una tabla con todas las ventas cerradas

### 8.2 Filtrar Ventas

Usa los filtros en la parte superior:

**Por Fecha:**
1. Selecciona **Fecha Inicio**
2. Selecciona **Fecha Fin**
3. Haz clic en **"Buscar"**

**Por Estado:**
- Todas
- Cerradas
- Canceladas

**Por Método de Pago:**
- Efectivo
- Tarjeta
- Transferencia
- Todos

### 8.3 Ver Resumen de Ventas

1. Haz clic en el botón **"Resumen"**
2. Verás un panel con estadísticas:
   - **Total de Órdenes**: Cantidad de órdenes en el período
   - **Ingresos Totales**: Suma de todos los pagos
   - **Total Pagos**: Cantidad de transacciones
   - **Promedio por Orden**: Ingreso promedio
   - **Por Método de Pago**: Desglose de pagos por método

### 8.4 Ver Detalles de una Venta

1. En la lista de ventas, haz clic en **"Ver Detalles"** (icono de ojo)
2. Se abrirá un modal con información completa:
   - **Información General**:
     - Número de orden
     - Fecha de creación
     - Fecha de cierre
     - Mesa
     - Mesero
     - Cajero
   
   - **Items de la Orden**:
     - Productos ordenados
     - Cantidades
     - Precios unitarios
     - Subtotales
   
   - **Desglose Financiero**:
     - Subtotal
     - IVA (19%)
     - Descuentos
     - **Total**
   
   - **Pagos Realizados**:
     - Método de pago
     - Monto
     - Número de referencia
     - Fecha y hora
     - Estado

### 8.5 Exportar Datos

> 📝 **Nota**: La funcionalidad de exportación a Excel/PDF estará disponible en futuras versiones.

---

## 9. Reportes

La sección de **Reportes** permite generar análisis detallados de las operaciones del bar.

### 9.1 Tipos de Reportes Disponibles

1. **Reporte de Ventas Diarias**
   - Ventas del día actual
   - Comparación con días anteriores
   - Métodos de pago utilizados

2. **Reporte de Productos Más Vendidos**
   - Ranking de productos
   - Cantidades vendidas
   - Ingresos por producto

3. **Reporte de Meseros**
   - Órdenes tomadas por mesero
   - Total de ventas por mesero
   - Promedio por orden

4. **Reporte de Métodos de Pago**
   - Distribución de pagos
   - Totales por método
   - Tendencias

### 9.2 Generar un Reporte

1. En el menú lateral, haz clic en **"Reportes"**
2. Selecciona el tipo de reporte deseado
3. Configura los filtros:
   - Rango de fechas
   - Sede (si aplica)
   - Otros filtros específicos
4. Haz clic en **"Generar Reporte"**
5. El reporte se mostrará en pantalla

### 9.3 Interpretar Reportes

- **Gráficos**: Visualización gráfica de los datos
- **Tablas**: Datos detallados en formato tabla
- **Métricas**: Indicadores clave resaltados

---

## 10. Analíticas

La sección de **Analíticas** proporciona visualizaciones avanzadas y tendencias.

### 10.1 Dashboard Analítico

1. En el menú lateral, haz clic en **"Analíticas"**
2. Verás gráficos interactivos con:
   - Tendencias de ventas
   - Comparaciones temporales
   - Análisis de productos
   - Comportamiento de clientes

### 10.2 Tipos de Gráficos

- **Gráficos de Línea**: Tendencias a lo largo del tiempo
- **Gráficos de Barras**: Comparaciones entre categorías
- **Gráficos de Torta**: Distribuciones porcentuales
- **Heatmaps**: Patrones de actividad

### 10.3 Personalizar Visualizaciones

1. Usa los controles en la parte superior
2. Selecciona el período de tiempo
3. Elige las métricas a mostrar
4. Los gráficos se actualizan automáticamente

---

## 11. Configuración de Perfil

### 11.1 Acceder a tu Perfil

1. Haz clic en el **avatar de usuario** (círculo dorado) en la esquina superior derecha
2. Se abrirá un menú desplegable
3. Selecciona **"Ver Perfil"**

### 11.2 Información Mostrada

El menú de usuario muestra:
- **Nombre completo**
- **Email**
- **Roles asignados**: Badges con tus roles (Administrador, Cajero, etc.)

### 11.3 Opciones Disponibles

- **Ver Perfil**: (Próximamente) Ver y editar información personal
- **Configuración**: (Próximamente) Ajustes de cuenta
- **Cerrar Sesión**: Salir del sistema

---

## 12. Preguntas Frecuentes

### ¿Cómo cambio mi contraseña?

Contacta al administrador del sistema. Solo los administradores pueden restablecer contraseñas por seguridad.

### ¿Puedo tener múltiples roles?

Sí, un usuario puede tener múltiples roles asignados (ej: Mesero y Cajero).

### ¿Qué pasa si cierro una orden por error?

Contacta al administrador. Solo los administradores pueden anular órdenes cerradas.

### ¿Los productos desactivados se eliminan?

No, los productos desactivados se mantienen en el sistema para mantener el historial, pero no aparecen en las opciones al crear nuevas órdenes.

### ¿Puedo procesar pagos parciales?

Sí, puedes procesar múltiples pagos para una misma orden. La orden se puede cerrar cuando el total pagado sea igual o mayor al total a pagar.

### ¿Cómo veo las ventas de un mes específico?

Ve a **"Historial de Ventas"**, selecciona el rango de fechas (primer y último día del mes) y haz clic en **"Buscar"**.

### ¿Qué significa el estado "Parcialmente Pagada"?

Significa que se han realizado uno o más pagos, pero el total pagado aún no cubre el total de la orden.

### ¿Puedo exportar los reportes?

La funcionalidad de exportación estará disponible en futuras versiones del sistema.

### ¿El sistema funciona sin conexión a internet?

No, el sistema requiere conexión a internet para funcionar, ya que es una aplicación web.

### ¿Cómo contacto al soporte?

Para problemas técnicos o consultas, contacta al administrador del sistema o al equipo de desarrollo.

---

## 📞 Soporte

Para asistencia adicional:
- **Email**: soporte@bar.com
- **Documentación Técnica**: Consulta la documentación del desarrollador
- **Administrador del Sistema**: Contacta al administrador de tu organización

---

## 📝 Notas Finales

- Este manual cubre las funcionalidades principales del sistema
- Algunas funcionalidades pueden variar según tu rol de usuario
- El sistema se actualiza regularmente con nuevas características
- Mantén este manual actualizado con las nuevas funcionalidades

---

**Versión del Manual**: 1.0  
**Última Actualización**: Noviembre 2025  
**Sistema**: Bar Management System v1.0.0

