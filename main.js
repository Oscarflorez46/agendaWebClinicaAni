document.addEventListener("DOMContentLoaded", function() {
    const pageTitle = document.title.toLowerCase();
    const pathname = window.location.pathname;
    
    // Mapeo de especialidades para cada médico.
    const doctorSpecialties = {
      "dr-perez": "Neurología",
      "dr-martinez": "terapia ocupacional",
      "dr-garcia": "terapia física",
      "dr-florez": "Psicologogía",
      "dr-ararat": "fonoaudiología",
    };
  
    /*** Página de Login ***/
    if(pageTitle.includes("login")) {
      const loginForm = document.getElementById("loginForm");
      loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        
        const users = JSON.parse(localStorage.getItem("users")) || [];
        // Busca usuario por correo (o podrías incluir también la cédula).
        const user = users.find(u => (u.email === username) && u.password === password);
        
        if(user) {
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          window.location.href = "dashboard.html";
        } else {
          document.getElementById("loginError").innerText = "Credenciales inválidas. Por favor, inténtalo de nuevo.";
        }
      });
    }
    
    /*** Página de Registro ***/
    if(pageTitle.includes("registro") || pathname.includes("registro.html")) {
      const registrationForm = document.getElementById("registrationForm");
      registrationForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if(users.some(u => u.email === email)) {
          document.getElementById("registrationError").innerText = "El usuario ya existe.";
          return;
        }
        
        const newUser = { fullName, email, password, role };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = "index.html";
      });
    }
    
    /*** Página de Dashboard ***/
    if(pageTitle.includes("dashboard") || pathname.includes("dashboard.html")) {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if(!loggedInUser) {
        window.location.href = "index.html";
      }
      
      // Manejo del formulario para agendar citas.
      const appointmentForm = document.getElementById("appointmentForm");
      if(appointmentForm) {
        appointmentForm.addEventListener("submit", function(e) {
          e.preventDefault();
          const medico = document.getElementById("medico").value;
          const date = document.getElementById("date").value;
          const time = document.getElementById("time").value;
          if(!date || !time) {
            alert("Por favor, selecciona fecha y hora.");
            return;
          }
          let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
          const specialty = doctorSpecialties[medico] || "No definida";
          // Creamos un identificador único para la cita.
          const appointment = { 
            id: new Date().getTime(),
            user: loggedInUser.email, 
            medico, 
            specialty, 
            date, 
            time 
          };
          appointments.push(appointment);
          localStorage.setItem("appointments", JSON.stringify(appointments));
          document.getElementById("appointmentMessage").innerText = "Cita agendada exitosamente.";
          appointmentForm.reset();
          loadAppointments();
        });
      }
      
      // Función para cargar y mostrar las citas programadas.
      function loadAppointments() {
        const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        // Filtrar solo las citas del usuario autenticado.
        let userAppointments = appointments.filter(app => app.user === loggedInUser.email);
        
        // Aplicar filtros seleccionados.
        const doctorFilterValue = document.getElementById("doctorFilter").value;
        const specialtyFilterValue = document.getElementById("specialtyFilter").value;
        if(doctorFilterValue) {
          userAppointments = userAppointments.filter(app => app.medico === doctorFilterValue);
        }
        if(specialtyFilterValue) {
          userAppointments = userAppointments.filter(app => app.specialty === specialtyFilterValue);
        }
        
        const tableBody = document.querySelector("#appointmentTable tbody");
        tableBody.innerHTML = "";
        
        if(userAppointments.length === 0) {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.colSpan = 5;
          cell.textContent = "No se encontraron citas.";
          row.appendChild(cell);
          tableBody.appendChild(row);
        } else {
          userAppointments.forEach(app => {
            const row = document.createElement("tr");
            
            const colMedico = document.createElement("td");
            colMedico.textContent = app.medico;
            row.appendChild(colMedico);
            
            const colSpecialty = document.createElement("td");
            colSpecialty.textContent = app.specialty;
            row.appendChild(colSpecialty);
            
            const colDate = document.createElement("td");
            colDate.textContent = app.date;
            row.appendChild(colDate);
            
            const colTime = document.createElement("td");
            colTime.textContent = app.time;
            row.appendChild(colTime);
            
            const colActions = document.createElement("td");
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancelar";
            cancelBtn.addEventListener("click", function() {
              cancelAppointment(app.id);
            });
            colActions.appendChild(cancelBtn);
            row.appendChild(colActions);
            
            tableBody.appendChild(row);
          });
        }
      }
      
      // Función para cancelar una cita (buscando por su id único).
      function cancelAppointment(id) {
        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem("appointments", JSON.stringify(appointments));
        alert("Cita cancelada exitosamente.");
        loadAppointments();
      }
      
      // Actualizar la lista de citas al cambiar los filtros.
      const doctorFilter = document.getElementById("doctorFilter");
      const specialtyFilter = document.getElementById("specialtyFilter");
      if(doctorFilter) {
        doctorFilter.addEventListener("change", loadAppointments);
      }
      if(specialtyFilter) {
        specialtyFilter.addEventListener("change", loadAppointments);
      }
      
      // Cargar las citas inicialmente.
      loadAppointments();
      
      // Funcionalidad de Cerrar Sesión.
      const logoutBtn = document.getElementById("logoutBtn");
      if(logoutBtn) {
        logoutBtn.addEventListener("click", function() {
          localStorage.removeItem("loggedInUser");
          window.location.href = "index.html";
        });
      }
    }
  });
  