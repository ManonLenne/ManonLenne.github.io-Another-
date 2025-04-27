const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEtwmhdjPcxMe-_Dp1w8PUMIBQwSCh6JPkxa06E0Bx4So8l178m0rmrmAI6o0ljZm9OopFn2D1IoTe/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text()




const sanitizeName = (name) => {
  console.log(name);
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  console.log(sanitized.replace(/[^A-Za-z0-9_\-]/g, '_'));
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};

/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};





const bgColors = ["black"];

const json = csvToJson(csvText);
console.log(json);

const $projets = document.querySelector(".projets");

// parcourir le json et créer les éléments
json.forEach((item) => {
  const div = document.createElement("div");
  $projets.appendChild(div);
  div.classList.add("projet");
  gsap.set(div,{backgroundColor: e => gsap.utils.random(bgColors)});
  gsap.from(div, {
    x: e=> gsap.utils.random(-1000,1000),
    y : e  => gsap.utils.random(-1000,-20),
    opacity:0, duration: 0.5 });

  const img = document.createElement("img");
  img.src = `img/${sanitizeName(item.titre)}.png`;
  div.appendChild(img);


  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  div.appendChild(titre);

  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  div.appendChild(categories);

  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);

  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    close.addEventListener("click", () => {
      gsap.to(overlay, {opacity: 0, duration: 1, onComplete: () => overlay.remove()});
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

    const img = document.createElement("img");
    img.src = `img/${sanitizeName(item.titre)}.png`;
    fiche.appendChild(img);

    const titre = document.createElement("h1");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if(item.images !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image}`;
        gallery.appendChild(img);
      });
      fiche.appendChild(gallery);
    }
  

    // gsap.from(fiche, {opacity: 0, duration: 0.4});
    gsap.from(overlay, {opacity: 0, duration: 0.4});
  });
});

// Add event listener to the h3 in the header
const headerH3 = document.querySelector("header h3");
headerH3.style.cursor = "pointer";
headerH3.addEventListener("click", () => {

  
  // Create the rectangle
  const rectangle = document.createElement("div");
  rectangle.style.position = "fixed";
  rectangle.style.top = "41%";
  rectangle.style.right = "0";
  rectangle.style.width = "400px"; // Adjust width as needed
  rectangle.style.height = "300px"; // Adjust height as needed
  rectangle.style.backgroundColor = "#dddada"; // Set the desired color
  rectangle.style.border = "2px solid black";
  rectangle.style.transform = "translateY(-50%)";
  rectangle.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  rectangle.style.zIndex = "1000";


    // Add the text inside the rectangle
    const title = document.createElement("h1");
    title.textContent = "A propos";
    title.style.position = "absolute";
    title.style.top = "10px";
    title.style.left = "50%";
    title.style.transform = "translateX(-50%)";
    title.style.fontSize = "24px"; // Adjust font size as needed
    title.style.color = "black"; // Set text color
    title.style.fontFamily = "'Times New Roman', serif"; // Apply Times New Roman font
    rectangle.appendChild(title);
  const text = document.createElement("p");
  text.textContent = "Bonjour, je m'appelle Manon Lenne et je suis actuellement étudiante en 2ème année à l'ESAD d'Amiens.\nPassionnée par l'art de manière générale, j'ai choisi de me spécialiser dans le design graphique.\nJe suis particulièrement intéressée par la création d'identités visuelles et la mise en page.\nJ'aime également explorer d'autres domaines tels que le dessin, la photographie et la mode.";
  text.style.position = "absolute";
  text.style.top = "50%";
  text.style.left = "50%";
  text.style.transform = "translate(-50%, -50%)";
  text.style.fontSize = "19px"; // Adjust font size as needed
  text.style.color = "black"; // Set text color
  text.style.textAlign = "center"; // Center the text
  text.style.fontFamily = "'Times New Roman', serif"; // Apply Times New Roman font
  text.style.width = "90%"; // Adjust width to fit within the rectangle
  text.style.wordWrap = "break-word"; // Ensure text wraps within the rectangle
  rectangle.appendChild(text);

  

  // Append the rectangle to the body
  document.body.appendChild(rectangle);


  // Add a close button inside the rectangle
  const closeButton = document.createElement("span");
  closeButton.textContent = "×";
  closeButton.style.position = "absolute";
  closeButton.style.top = "5px";
  closeButton.style.right = "10px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "16px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.color = "black";
  rectangle.appendChild(closeButton);

  // Close the rectangle when the close button is clicked
  closeButton.addEventListener("click", () => {
    rectangle.remove();
  });
});



// Ensure all images have the same size
const setImageSize = (width, height) => {
  const images = document.querySelectorAll(".projets img");
  images.forEach((img) => {
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.objectFit = "cover"; // Ensures the image fits within the dimensions
  });
};

// // Remove all elements except the title and images
// json.forEach((item, index) => {
//   const div = document.querySelectorAll(".projet")[index];
  
//   // Remove all child elements except the title and image
//   while (div.firstChild) {
//     div.removeChild(div.firstChild);
//   }

//   // Add the image
//   const img = document.createElement("img");
//   img.src = `img/${sanitizeName(item.titre)}.png`;
//   div.appendChild(img);

//   // Add the title
//   const titre = document.createElement("h1");
//   titre.textContent = item.titre;
//   div.appendChild(titre);
// });




// Remove the black background color from the projects
document.querySelectorAll(".projet").forEach((div) => {
  div.style.backgroundColor = "transparent";
  // Set the text color to black and apply the Montserrat font
  document.querySelectorAll(".projet h1").forEach((titre) => {
    titre.style.color = "black";
    titre.style.fontFamily = "'times new roman', serif"; // Change to your desired font
  });
  // Set the font size of the titles to be smaller
  document.querySelectorAll(".projet h1").forEach((titre) => {
    titre.style.fontSize = "10px"; // Adjust the size as needed
  });


  // Set the text color of the categories to black and apply the Montserrat font
  document.querySelectorAll(".projet div").forEach((categories) => {
    categories.style.color = "black";
    categories.style.fontFamily = "'times new roman', serif"; // Change to your desired font
    categories.style.fontSize = "8px"; // Adjust the size as needed
    categories.style.textAlign = "center"; // Center the text
    categories.style.fontWeight = "bold"; // Make the text bold
  });
  // Set the text color of the descriptions to black and apply the Montserrat font
  document.querySelectorAll(".projet p").forEach((description) => {
    description.style.color = "black";
    description.style.fontFamily = "'times new roman', serif"; // Change to your desired font
    description.style.fontSize = "8px"; // Adjust the size as needed
    description.style.textAlign = "center"; // Center the text
    description.style.fontWeight = "bold"; // Make the text bold
  });
 
// Place categories and descriptions on the same line
document.querySelectorAll(".projet").forEach((div) => {
  const categories = div.querySelector("div");
  const description = div.querySelector("p");

  // Wrap categories and descriptions in a container
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.justifyContent = "space-between";
  container.style.alignItems = "center";
  container.style.marginTop = "5px"; // Add spacing above the container

  // Move categories and descriptions into the container
  container.appendChild(categories);
  container.appendChild(description);

  // Append the container to the project div
  div.appendChild(container);

  // Adjust styles for categories and descriptions
  categories.style.margin = "0";
  description.style.margin = "0";
});

  // Ensure all images have the same size
  const images = document.querySelectorAll(".projet img");
  images.forEach((img) => {
    img.style.width = "150px"; // Set desired width
    img.style.height = "150px"; // Set desired height
    img.style.objectFit = "cover"; // Ensures the image fits within the dimensions
  });
});

// Position the title above the images
document.querySelectorAll(".projet").forEach((div) => {
  const img = div.querySelector("img");
  const titre = div.querySelector("h1");
  // Hide the title initially
  titre.style.opacity = "0";

  // Show the title only when the project is enlarged
  div.addEventListener("mouseenter", () => {
    gsap.to(titre, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
  });

  div.addEventListener("mouseleave", () => {
    gsap.to(titre, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
  });

  // Hide the description and category initially
  const description = div.querySelector("p");
  const category = div.querySelector("div");
  description.style.opacity = "0";
  category.style.opacity = "0";

  // Show the description and category only when the project is enlarged
  div.addEventListener("mouseenter", () => {
    gsap.to(description, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(category, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
  });

  div.addEventListener("mouseleave", () => {
    gsap.to(description, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(category, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
  });

  // Ensure the title is above the image
  div.style.position = "relative";
  titre.style.position = "absolute";
  titre.style.top = "-30px"; // Adjust the value as needed
  titre.style.left = "50%";
  titre.style.transform = "translateX(-50%)";
  titre.style.padding = "2px 5px"; // Optional: Add padding for better appearance
});

// Align projects in a horizontal line
document.querySelectorAll(".projet").forEach((div) => {
  div.style.display = "inline-block"; // Set display to inline-block
  div.style.marginRight = "10px"; // Add spacing between projects
  div.style.verticalAlign = "top"; // Align projects to the top
});

// Ensure the container has enough width to fit all projects
$projets.style.display = "block";
$projets.style.whiteSpace = "nowrap";

// Remove overflow at the bottom of the page
document.body.style.overflowX = "hidden";





// // Create a continuous scrolling effect for the projects
// const scrollSpeed = 300; // Adjust the speed of the scrolling
// const projetsWidth = $projets.scrollWidth;


// const animateProjects = () => {
//   gsap.to($projets, {
//     x: `-${projetsWidth}px`,
//     duration: projetsWidth / scrollSpeed,
//     ease: "linear",
//     onComplete: () => {
//       gsap.set($projets, { x: "0px" });
//       animateProjects(); // Restart the animation
      
//     }
//   });
  
// };

// // Start the animation
// animateProjects();


// Create a linear sliding effect from right to left
const slideProjects = () => {
  const projets = document.querySelectorAll(".projet");
  const containerWidth = $projets.offsetWidth;
  const projetWidth = projets[0].offsetWidth;
  const spacing = 10; // Distance between projects
  const totalWidth = (projetWidth + spacing) * projets.length;

  // Add hover effect to enlarge projects
  projets.forEach((projet) => {
    projet.addEventListener("mouseenter", () => {
      gsap.to(projet, { scale: 1.2, duration: 0.3, ease: "power2.out" });
    });

    projet.addEventListener("mouseleave", () => {
      gsap.to(projet, { scale: 1, duration: 0.3, ease: "power2.out" });
    });

    // Show the title only when the project is enlarged
    projet.addEventListener("mouseenter", () => {
      const titre = projet.querySelector("h1");
      gsap.to(titre, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    });

    projet.addEventListener("mouseleave", () => {
      const titre = projet.querySelector("h1");
      gsap.to(titre, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
    });

    // Push other projects away while keeping their size
    projet.addEventListener("mouseenter", () => {
      projets.forEach((otherProjet) => {
      if (otherProjet !== projet) {
        gsap.to(otherProjet, {
        x: (otherProjet.offsetLeft < projet.offsetLeft ? -50 : 50), // Push left or right
        duration: 0.3,
        ease: "power2.out"
        });
      }
      });
    });

    projet.addEventListener("mouseleave", () => {
      projets.forEach((otherProjet) => {
      if (otherProjet !== projet) {
        gsap.to(otherProjet, {
        x: 0, // Reset position
        duration: 0.3,
        ease: "power2.out"
        });
      }
      });
    });
  });
  
  
  // Set initial positions for all projects
  projets.forEach((projet, index) => {
    projet.style.position = "absolute";
    projet.style.left = `${index * (projetWidth + spacing)}px`;
  });

  // Animate the sliding effect
  const animate = () => {
    projets.forEach((projet) => {
      const currentLeft = parseFloat(projet.style.left);
      const newLeft = currentLeft - 1; // Adjust speed by changing this value

      if (newLeft + projetWidth < 0) {
        // If the project is out of the screen on the left, move it to the right
        projet.style.left = `${totalWidth - projetWidth}px`;
      } else {
        projet.style.left = `${newLeft}px`;
      }
    });

    
    

    requestAnimationFrame(animate);
  };

  animate();
};




// Start the sliding effect
slideProjects();








const main = document.querySelector('.main');
const inner = main.innerHTML;
const w = window.innerWidth;
const h = document.body.clientHeight + 150;
const r = w/h;
const m = Math.floor(w/30);
const nbrx = Math.floor(w/m);

for(let i=0;i<83;i++){
  main.innerHTML+=inner;
}

const split = new SplitText(".main",{type:"chars"});

gsap.set("body", {autoAlpha: 1});
gsap.set('.main>div:nth-child( n + 11)',{opacity:0});
gsap.set('.main>div:nth-child(-n + 11)',{x:function(i){
 return i*10-50; 
}});



const tl = gsap.timeline({delay: 2,repeat:-1});










