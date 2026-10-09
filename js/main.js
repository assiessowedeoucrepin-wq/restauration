// Initialisation du panier depuis le localStorage (ou tableau vide)
let panier = JSON.parse(localStorage.getItem('panierChezMaman')) || [];

// Mettre à jour le compteur du panier dans le header
function mettreAJourCompteur() {
    const totalArticles = panier.reduce((sum, item) => sum + item.quantite, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalArticles;
    }
}

// Ajouter un produit au panier
function ajouterAuPanier(nom, prix) {
    const produitExistant = panier.find(item => item.nom === nom);
    if (produitExistant) {
        produitExistant.quantite += 1;
    } else {
        panier.push({ nom: nom, prix: prix, quantite: 1 });
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('panierChezMaman', JSON.stringify(panier));
    mettreAJourCompteur();
    
    alert(`"${nom}" a été ajouté à votre panier !`);
}

// Afficher le panier dans panier.html
function afficherPanier() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');
    
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let totalGlobal = 0;

    if (panier.length === 0) {
        cartItemsContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Votre panier est vide.</td></tr>`;
        if (totalPriceEl) totalPriceEl.textContent = '0 FCFA';
        return;
    }

    panier.forEach((item, index) => {
        let totalLigne = item.prix * item.quantite;
        totalGlobal += totalLigne;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nom}</td>
            <td>${item.prix.toLocaleString()} FCFA</td>
            <td>
                <button onclick="changerQuantite(${index}, -1)" style="padding: 2px 6px;">-</button>
                <span style="margin: 0 8px;">${item.quantite}</span>
                <button onclick="changerQuantite(${index}, 1)" style="padding: 2px 6px;">+</button>
            </td>
            <td>${totalLigne.toLocaleString()} FCFA</td>
            <td><button onclick="supprimerArticle(${index})" style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Supprimer</button></td>
        `;
        cartItemsContainer.appendChild(tr);
    });

    if (totalPriceEl) {
        totalPriceEl.textContent = `${totalGlobal.toLocaleString()} FCFA`;
    }
}

// Modifier la quantité d'un article
function changerQuantite(index, delta) {
    panier[index].quantite += delta;
    if (panier[index].quantite <= 0) {
        panier.splice(index, 1);
    }
    localStorage.setItem('panierChezMaman', JSON.stringify(panier));
    afficherPanier();
    mettreAJourCompteur();
}

// Supprimer un article du panier
function supprimerArticle(index) {
    panier.splice(index, 1);
    localStorage.setItem('panierChezMaman', JSON.stringify(panier));
    afficherPanier();
    mettreAJourCompteur();
}

// Passer la commande et l'envoyer sur WhatsApp
function passerCommande(event) {
    event.preventDefault();
    
    if (panier.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const nom = document.getElementById('client-name').value;
    const telephone = document.getElementById('client-phone').value;
    const adresse = document.getElementById('client-address').value;
    const paiement = document.getElementById('payment-method').value;

    // Calculer le total
    let totalGlobal = panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);

    // Formater la liste des articles pour le message
    let detailsArticles = panier.map(item => `- ${item.quantite}x ${item.nom} (${(item.prix * item.quantite).toLocaleString()} FCFA)`).join('%0A');

    // Votre numéro WhatsApp professionnel (remplacez par votre numéro au format international sans le +)
    // Exemple pour le Togo (+228) : 22893213229
    const numeroWhatsApp = "22893213229"; 

    // Création du message pré-rempli
    let messageWhatsApp = `*Nouvelle Commande - Chez Maman*%0A%0A` +
        `*Client :* ${nom}%0A` +
        `*Téléphone :* ${telephone}%0A` +
        `*Adresse :* ${adresse}%0A` +
        `*Paiement :* ${paiement}%0A%0A` +
        `*Détails de la commande :*%0A${detailsArticles}%0A%0A` +
        `*Total à payer :* ${totalGlobal.toLocaleString()} FCFA`;

    const commandeData = {
        nom,
        telephone,
        adresse,
        paiement,
        articles: panier,
        total: totalGlobal,
        date: new Date().toLocaleString()
    };

    // Sauvegarder pour la page de suivi
    localStorage.setItem('derniereCommandeChezMaman', JSON.stringify(commandeData));
    
    // Vider le panier
    panier = [];
    localStorage.removeItem('panierChezMaman');

    // Rediriger vers WhatsApp
    window.open(`https://wa.me/${numeroWhatsApp}?text=${messageWhatsApp}`, '_blank');

    // Rediriger ensuite vers la page de suivi
    window.location.href = 'suivi.html';
}

// Charger les informations de suivi
function afficherSuivi() {
    const trackingInfo = document.getElementById('tracking-info');
    if (!trackingInfo) return;

    const derniereCommande = JSON.parse(localStorage.getItem('derniereCommandeChezMaman'));

    if (!derniereCommande) {
        trackingInfo.innerHTML = `<p style="text-align: center; color: #666;">Aucune commande récente trouvée.</p>`;
        return;
    }

    let listeArticles = derniereCommande.articles.map(a => `<li>${a.quantite}x ${a.nom} (${(a.prix * a.quantite).toLocaleString()} FCFA)</li>`).join('');

    trackingInfo.innerHTML = `
        <div style="background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 2rem;">
            <h3>Détails de votre commande</h3>
            <p><strong>Client :</strong> ${derniereCommande.nom}</p>
            <p><strong>Téléphone :</strong> ${derniereCommande.telephone}</p>
            <p><strong>Adresse :</strong> ${derniereCommande.adresse}</p>
            <p><strong>Mode de paiement :</strong> ${derniereCommande.paiement}</p>
            <p><strong>Date :</strong> ${derniereCommande.date}</p>
            <h4 style="margin-top: 1rem;">Articles :</h4>
            <ul style="padding-left: 20px;">${listeArticles}</ul>
            <p style="margin-top: 1rem; font-size: 1.1rem; color: #e65100;"><strong>Total : ${derniereCommande.total.toLocaleString()} FCFA</strong></p>
        </div>
    `;
}

// Initialisation automatique au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    mettreAJourCompteur();
    afficherPanier();
    afficherSuivi();
});