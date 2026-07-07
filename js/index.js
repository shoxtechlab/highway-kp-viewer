async function main() {

    const routes = await fetch("./data/routes.json")
        .then(r => r.json());

    const container = document.getElementById("route-list");

    routes.forEach(route => {

        const link = document.createElement("a");

        link.href = `viewer.html?route=${route.id}`;
        link.textContent = route.name;

        link.style.display = "block";
        link.style.margin = "8px 0";

        container.appendChild(link);
    });
}

main();