# Módulo de Historial de Meets

Este módulo implementa la funcionalidad de historial de conversaciones (Meets) para usuarios Premium.

## Estructura de Archivos

```
src/pages/history/
├── History.jsx          # Vista principal del historial
├── HistorySearch.jsx    # Componente de búsqueda y filtrado
└── MeetDetail.jsx       # Modal para ver detalles de un meet

src/services/api/
└── history.service.js   # Servicio para comunicación con el backend
```

## Características Implementadas

### 1. Vista Principal (History.jsx)
- ✅ Verificación de plan Premium (solo usuarios Premium pueden acceder)
- ✅ Listado completo de meets del usuario
- ✅ Visualización de fecha, participantes y cantidad de mensajes
- ✅ Eliminación individual de meets
- ✅ Eliminación completa del historial
- ✅ Modal de confirmación para eliminaciones
- ✅ Integración con el sistema de búsqueda y filtrado

### 2. Búsqueda y Filtrado (HistorySearch.jsx)
- ✅ Búsqueda por palabras clave en:
  - Contenido de mensajes
  - Nombres de remitentes
  - Nombres de participantes
- ✅ Filtro por rango de fechas (fecha inicio y fecha fin)
- ✅ Botón para limpiar todos los filtros
- ✅ Interfaz intuitiva con iconos

### 3. Detalle de Meet (MeetDetail.jsx)
- ✅ Modal con información completa del meet
- ✅ Visualización de fecha y hora formateada
- ✅ Lista de participantes con badges
- ✅ Lista completa de mensajes con:
  - Nombre del remitente
  - Contenido del mensaje
  - Tipo de mensaje (chat, seña, subtítulo)
  - Timestamp del mensaje
  - Iconos diferenciados por tipo
- ✅ Diseño responsive y fácil de usar

### 4. Servicio de API (history.service.js)
- ✅ `getHistory()` - Obtiene el historial completo
- ✅ `getMeetById(meetId)` - Obtiene un meet específico con mensajes
- ✅ `deleteMeet(meetId)` - Elimina un meet individual
- ✅ `deleteAllHistory()` - Elimina todo el historial

## Modelo de Datos

### Meet
```javascript
{
  id: string,
  date: string (ISO 8601),
  participants: string[],
  messages: Message[]
}
```

### Message
```javascript
{
  sender: string,          // Nombre del remitente
  content: string,         // Contenido del mensaje
  type: string,           // 'chat' | 'seña' | 'subtitulo'
  timestamp: string       // ISO 8601 (opcional)
}
```

## Tipos de Mensaje

1. **chat**: Mensaje de texto normal
   - Icono: 💬 (MessageCircle - verde)
   
2. **seña**: Mensaje gestual o visual
   - Icono: 🤚 (Hand - naranja)
   
3. **subtitulo**: Texto generado por voz a texto
   - Icono: 💬 (Subtitles - azul)

## Endpoints del Backend Esperados

```
GET    /meets/history           # Obtener historial completo
GET    /meets/:meetId           # Obtener meet específico
DELETE /meets/:meetId           # Eliminar meet individual
DELETE /meets/history           # Eliminar todo el historial
```

## Integración con el Proyecto

### Router
La ruta `/history` está configurada como ruta privada en `router.jsx`:

```jsx
{ path: "history", element: <History /> }
```

### Navegación
El enlace al historial está disponible en el menú de usuario del `Topbar`:
- Icono: History
- Etiqueta: "Historial"

### Protección de Ruta
- La vista verifica automáticamente si el usuario tiene plan Premium
- Si no es Premium, redirige a `/plans` con un mensaje de error
- Utiliza `planService.getCurrentPlan()` para la verificación

## Estilos y UI

El módulo sigue el mismo sistema de diseño usado en el resto de la aplicación:
- Colores principales: Naranja (#ff6b3d) y grises
- Cards con sombras y bordes redondeados
- Botones con estados hover
- Diseño responsive con Tailwind CSS
- Iconos de Lucide React

## Notificaciones

Se utilizan toasts de `react-toastify` para:
- ✅ Confirmaciones de eliminación exitosa
- ❌ Errores al cargar datos
- ❌ Errores al eliminar
- ℹ️ Restricciones de plan Premium

## Uso

1. El usuario debe tener un plan Premium activo
2. Navegar a `/history` o usar el menú de usuario → Historial
3. Ver el listado de meets previos
4. Usar la búsqueda para filtrar conversaciones
5. Hacer clic en "Ver detalles" para ver los mensajes
6. Eliminar meets individuales o todo el historial según necesidad

## Consideraciones de Desarrollo

- Los endpoints del backend deben estar implementados según la especificación
- El token de autenticación se envía automáticamente mediante el interceptor
- Las fechas se formatean en español (es-ES)
- El componente maneja estados de carga y errores adecuadamente
