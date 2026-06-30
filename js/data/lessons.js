const lesson = (id,title,duration,summary,sections,keyPoints) => Object.freeze({id,title,duration,summary,sections:Object.freeze(sections),keyPoints:Object.freeze(keyPoints)});

export const lessons = Object.freeze([
  lesson("que-es-el-tarot","Qué es el tarot",6,"Una estructura de imágenes para pensar preguntas, ciclos y decisiones.",[
    {title:"Un lenguaje visual",text:"El tarot reúne 78 escenas simbólicas. Puede utilizarse como apoyo narrativo para observar una situación desde ángulos que la conversación cotidiana no siempre muestra."},
    {title:"Símbolo, no sentencia",text:"Una carta no contiene una predicción inmutable. Su significado aparece al relacionar imagen, posición, pregunta y experiencia de quien consulta."}
  ],["El mazo propone perspectivas.","El contexto modifica el significado.","No existe una interpretación universal única."]),
  lesson("historia-y-simbolo","Historia general y uso simbólico",8,"Del juego de cartas europeo a una práctica contemporánea de reflexión.",[
    {title:"Una historia con capas",text:"Las primeras barajas de tarot documentadas surgieron en Europa como juegos de cartas. Con el tiempo, distintas corrientes añadieron asociaciones filosóficas, artísticas y esotéricas."},
    {title:"Tradiciones diversas",text:"Marsella, Rider-Waite-Smith y otras escuelas organizan ciertos símbolos de manera diferente. Estudiar sus contrastes evita presentar una sola tradición como verdad definitiva."}
  ],["El uso adivinatorio apareció después del juego.","Cada escuela aporta convenciones propias.","La lectura moderna puede ser secular, espiritual o creativa."]),
  lesson("arcanos-mayores","Arcanos mayores",7,"Veintidós arquetipos que describen umbrales y aprendizajes amplios.",[
    {title:"El arco mayor",text:"Desde El Loco hasta El Mundo, los mayores pueden leerse como etapas de experiencia: iniciativa, vínculo, crisis, integración y renovación."},
    {title:"Peso en una tirada",text:"La presencia de varios mayores suele invitar a mirar el aprendizaje estructural de la consulta, sin asumir que todo será más dramático o inevitable."}
  ],["Son 22 cartas.","Representan temas amplios.","Su intensidad depende de la posición y las cartas vecinas."]),
  lesson("arcanos-menores","Arcanos menores",7,"Cincuenta y seis cartas para procesos cotidianos, recursos y relaciones.",[
    {title:"Cuatro ámbitos",text:"Los menores se distribuyen en Bastos, Copas, Espadas y Oros. Cada palo enfoca un modo distinto de vivir la misma pregunta."},
    {title:"Del As al Rey",text:"Las cartas numeradas describen desarrollo y movimiento. Las figuras de corte pueden representar actitudes, habilidades, roles o personas, según el contexto."}
  ],["Hay 14 cartas por palo.","Lo cotidiano también contiene aprendizaje.","Las figuras no tienen que señalar literalmente a una persona."]),
  lesson("cuatro-palos","Significado de los cuatro palos",8,"Acción, emoción, pensamiento y materia como cuatro lentes complementarias.",[
    {title:"Bastos y Copas",text:"Bastos se asocia con fuego, iniciativa y creatividad. Copas habla de emociones, vínculos e intuición."},
    {title:"Espadas y Oros",text:"Espadas aborda mente, conflicto, verdad y decisiones. Oros se relaciona con cuerpo, trabajo, recursos y estabilidad."}
  ],["Ningún palo es bueno o malo.","Un predominio muestra dónde se concentra la atención.","La ausencia de un palo también puede ser informativa."]),
  lesson("numeros-y-corte","Números y figuras de corte",9,"Reconoce ritmos numéricos y formas de encarnar la energía de cada palo.",[
    {title:"Secuencia numérica",text:"El As inicia; los doses contrastan; los tres desarrollan; los cuatro estabilizan; los cinco tensionan; del seis al diez se despliegan ajustes, logros y cierres."},
    {title:"Sota, Caballero, Reina y Rey",text:"La Sota explora, el Caballero moviliza, la Reina interioriza y sostiene, y el Rey organiza y expresa hacia fuera. Son funciones flexibles, no estereotipos de género."}
  ],["Busca el verbo de cada número.","Compara el mismo número entre palos.","Lee las figuras como actitudes antes de asignarlas a personas."]),
  lesson("buena-pregunta","Cómo formular una buena pregunta",6,"Una pregunta clara abre más posibilidades que una petición de certeza absoluta.",[
    {title:"Foco y margen de acción",text:"Delimita el tema y pregunta qué puedes comprender, cuidar o decidir. Un periodo razonable puede ayudar si la consulta es demasiado amplia."},
    {title:"Ejemplo",text:"En vez de «¿Todo saldrá bien?», prueba «¿Qué recursos y riesgos conviene considerar al iniciar este proyecto?»."}
  ],["Pregunta por tu margen de acción.","Evita asumir hechos no verificados.","Una consulta puede reformularse durante la lectura."]),
  lesson("abiertas-y-cerradas","Preguntas abiertas frente a cerradas",5,"Elige el formato según la profundidad que necesitas.",[
    {title:"Preguntas abiertas",text:"Qué, cómo y para qué favorecen matices, condiciones y alternativas. Funcionan bien para aprendizaje y decisiones complejas."},
    {title:"Preguntas cerradas",text:"Las preguntas de sí o no pueden servir para enfocar, pero necesitan explicación y un factor que pueda modificar la tendencia."}
  ],["Lo cerrado orienta; no garantiza.","Lo abierto amplía agencia.","Puedes combinar una respuesta breve con una pregunta de seguimiento."]),
  lesson("preparar-lectura","Cómo preparar una lectura",6,"Crea un marco sencillo, privado y suficientemente tranquilo.",[
    {title:"Preparación externa",text:"Define la tirada, despeja una superficie y reduce interrupciones. Los rituales son opcionales; su función útil es señalar un cambio de atención."},
    {title:"Preparación interna",text:"Reconoce expectativas y emociones antes de sacar cartas. No necesitas una mente en blanco, solo volver a la pregunta con curiosidad."}
  ],["Elige la tirada antes de barajar.","Anota la pregunta exacta.","Pausa si la activación emocional impide interpretar con cuidado."]),
  lesson("como-barajar","Cómo barajar",5,"Mezcla de forma cómoda, consistente y respetuosa con tus cartas.",[
    {title:"Métodos",text:"Puedes mezclar en mano, sobre una mesa o cortar en varios montones. Ningún método es intrínsecamente más correcto."},
    {title:"Cuándo detenerse",text:"Detente cuando el mazo esté razonablemente mezclado y sientas que puedes pasar a la selección. No hace falta esperar una señal extraordinaria."}
  ],["Cuida tus manos y el mazo.","La aleatoriedad no depende de un ritual perfecto.","Las invertidas requieren mezclar orientaciones deliberadamente."]),
  lesson("elegir-cartas","Cómo elegir cartas",5,"Selección manual o automática: dos caminos válidos hacia la misma práctica.",[
    {title:"Selección manual",text:"Puedes extender las cartas y escoger por intuición, posición o ritmo. Evita buscar una sensación perfecta que convierta la elección en ansiedad."},
    {title:"Selección automática",text:"Un sistema aleatorio reduce la intervención consciente. La interpretación sigue dependiendo del contexto, no del mecanismo de selección."}
  ],["No repitas cartas dentro de una tirada.","Respeta la cantidad de posiciones.","Registra la orientación como parte del dato."]),
  lesson("derechas-invertidas","Cartas derechas e invertidas",7,"La inversión puede expresar bloqueo, exceso, interiorización o revisión.",[
    {title:"No es simplemente lo contrario",text:"Una carta invertida puede ralentizar una energía, volverla interna o mostrar una dificultad para expresarla. El significado derecho sigue siendo la referencia."},
    {title:"Usarlas o no",text:"Hay lectores que no utilizan invertidas y trabajan la sombra mediante posiciones y combinaciones. Ambas opciones son coherentes si se aplican con claridad."}
  ],["Invertida no significa mala.","Define tu método antes de sacar cartas.","Compara orientación, posición y pregunta."]),
  lesson("interpretar-una-carta","Cómo interpretar una carta",8,"Pasa de la observación visual a una síntesis contextual.",[
    {title:"Tres pasos",text:"Primero describe lo que ves sin interpretar. Después identifica acción, emoción y tensión. Finalmente conecta esos elementos con la función de la posición."},
    {title:"Construir una frase",text:"Usa una estructura sencilla: «En esta posición, la carta sugiere…; como recurso ofrece…; conviene considerar…»."}
  ],["Empieza por la imagen.","Selecciona pocos significados relevantes.","Termina con una pregunta o acción posible."]),
  lesson("interpretar-combinaciones","Cómo interpretar combinaciones",9,"Lee relaciones entre cartas en vez de sumar definiciones aisladas.",[
    {title:"Continuidad y contraste",text:"Observa si las cartas comparten elemento, dirección, número o actitud. Luego pregunta si se apoyan, se contradicen o muestran una secuencia."},
    {title:"Una oración conjunta",text:"Nombra la primera carta como situación y la siguiente como verbo que la modifica. Esta técnica ayuda a evitar párrafos desconectados."}
  ],["Busca una relación dominante.","No fuerces todas las correspondencias.","La posición decide qué relación resulta útil."]),
  lesson("detectar-patrones","Cómo detectar patrones",8,"Palos, números, mayores, figuras e invertidas revelan el clima de conjunto.",[
    {title:"Contar antes de concluir",text:"Registra cuántos mayores, palos, figuras y cartas invertidas aparecen. Los patrones necesitan más de una señal."},
    {title:"Equilibrio",text:"Un palo dominante muestra concentración; varios elementos sugieren integración. Una ausencia no prueba un problema: formula una hipótesis y contrástala con la pregunta."}
  ],["Distingue observación de interpretación.","Las repeticiones aumentan énfasis.","Las contradicciones pueden representar ambivalencia."]),
  lesson("tirada-una-carta","Lectura de una carta",5,"Una imagen para centrar mensaje, energía y consejo.",[
    {title:"Cuándo usarla",text:"Es útil para una pausa diaria, una pregunta concreta o el cierre de otra tirada. Su brevedad exige una pregunta bien enfocada."},
    {title:"Estructura",text:"Resume respuesta central, energía disponible, consejo y aspecto a considerar. Evita pedirle a una sola carta que explique una situación entera."}
  ],["Una carta no significa una verdad absoluta.","Incluye luz y límite.","Cierra con una acción pequeña."]),
  lesson("tirada-dos-cartas","Lectura de dos cartas",6,"El significado nace del vínculo entre dos funciones.",[
    {title:"Pares útiles",text:"Situación y consejo, visible y oculto, problema y solución, o presente y evolución son configuraciones claras."},
    {title:"El puente",text:"Interpreta cada posición y después escribe una frase que explique cómo la segunda responde, corrige o desarrolla a la primera."}
  ],["Nombra las posiciones antes de elegir.","Compara elementos y orientaciones.","No conviertas contraste en conflicto automáticamente."]),
  lesson("pasado-presente-futuro","Pasado, presente y futuro",7,"Una línea temporal para influencias, condiciones y tendencia modificable.",[
    {title:"Tiempo simbólico",text:"Pasado describe una influencia, presente muestra el marco actual y futuro señala una tendencia si las condiciones continúan."},
    {title:"Evitar determinismo",text:"Lee la última carta como escenario y pregunta qué decisiones podrían fortalecerlo o modificarlo."}
  ],["El pasado no es una cronología completa.","El presente conecta las otras dos cartas.","El futuro permanece abierto."]),
  lesson("cruz-celta","Cruz celta",12,"Diez posiciones organizadas por núcleo, tiempo, actitud y entorno.",[
    {title:"Leer por grupos",text:"Empieza con situación, desafío y base. Continúa por el eje temporal y luego observa actitud, entorno, esperanzas o miedos y resultado."},
    {title:"Síntesis",text:"Relaciona pasado con desafío, actitud con entorno y aspiración con resultado. La carta final es una tendencia dentro del sistema completo."}
  ],["No interpretes diez monólogos.","Resume cada grupo antes de unirlos.","Vuelve a la pregunta al finalizar."]),
  lesson("errores-frecuentes","Errores frecuentes",7,"Atajos que reducen claridad y cómo corregirlos.",[
    {title:"Exceso de literalidad",text:"Tomar una carta como hecho confirmado ignora contexto y lenguaje simbólico. También es frecuente sacar más cartas hasta obtener la respuesta deseada."},
    {title:"Sobrecarga",text:"Usar demasiadas correspondencias puede ocultar el mensaje central. Prioriza posición, imagen y dos o tres significados coherentes."}
  ],["No repitas la pregunta compulsivamente.","No conviertas una palabra clave en diagnóstico.","Registra dudas en lugar de inventar certeza."]),
  lesson("etica","Ética al leer tarot",8,"Consentimiento, honestidad y autonomía sostienen una práctica responsable.",[
    {title:"Transparencia",text:"Explica el carácter simbólico de la lectura y sus límites. Distingue tu interpretación de los hechos conocidos."},
    {title:"Autonomía",text:"Ofrece opciones y preguntas, no órdenes. Evita usar miedo, dependencia o promesas para influir en decisiones."}
  ],["Pide consentimiento.","Protege la confidencialidad.","Devuelve la decisión a quien consulta."]),
  lesson("leer-para-otra-persona","Cómo leer para otra persona",8,"Escucha, acuerda el marco y habla desde los símbolos.",[
    {title:"Antes de empezar",text:"Pregunta qué desea explorar, qué temas prefiere no abordar y cuánto tiempo tienen. Reformula preguntas que invadan la privacidad de terceros."},
    {title:"Durante la lectura",text:"Usa frases como «la carta sugiere» y comprueba cómo resuena la interpretación. La persona consultante conoce mejor su propia vida."}
  ],["No leas sin consentimiento.","No afirmes conocer pensamientos privados.","Invita a contrastar la lectura con la experiencia real."]),
  lesson("limites-responsables","Límites responsables",8,"Reconoce cuándo el tarot no es la herramienta adecuada.",[
    {title:"Atención profesional",text:"El tarot no sustituye atención médica, psicológica, legal, financiera ni de seguridad. Ante riesgo o urgencia, prioriza recursos profesionales y apoyo directo."},
    {title:"Pausa y derivación",text:"Detén la lectura si aumenta el miedo, la dependencia o la desregulación. Una respuesta responsable puede ser reconocer el límite y orientar hacia ayuda pertinente."}
  ],["No diagnostiques.","No prometas resultados económicos o legales.","Privacidad, seguridad y bienestar tienen prioridad."])
]);

export function getLessonById(id) { return lessons.find(item => item.id === id) ?? null; }
