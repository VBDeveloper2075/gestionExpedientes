# Corrida local de JP3 (one‑click)

Última actualización: 2025-09-02

Pasos para un usuario sin conocimientos técnicos:

1) Haga doble clic en el archivo iniciar_app_jp3.bat.
2) El script creará la base de datos jp3_db (si no existe), instalará dependencias y levantará:
	 - Backend en http://localhost:5000
	 - Frontend en http://localhost:3000

Requisitos mínimos:
- Tener MySQL instalado. En Windows se recomienda XAMPP. El script intenta usar C:\xampp\mysql\bin\mysql.exe y, si no está, busca mysql.exe en el PATH.
- Usuario MySQL root sin contraseña (configuración típica de XAMPP). Si tiene contraseña, abra cmd y ejecute:
	set MYSQL_PWD=SU_CONTRASEÑA
	iniciar_app_jp3.bat

Notas:
- Si es la primera vez, la instalación de dependencias puede tardar varios minutos.
- El backend usa los valores de .env locales. Si no existe .env, el script lo creará automáticamente con valores predeterminados seguros para desarrollo.
- Para cerrar, cierre las dos ventanas de cmd abiertas (frontend y backend).

