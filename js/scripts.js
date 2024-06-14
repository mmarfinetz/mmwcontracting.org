// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
    
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add event listener to the "Generate Quote" button
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('calculate-quote-button').addEventListener('click', calculateQuote);
});
// Function to calculate the power washing quote
function calculateQuote() {
    const surface = document.getElementById('surface').value;
    const area = parseFloat(document.getElementById('area').value);
    const linearFeet = parseFloat(document.getElementById('linear_feet').value);
    const stories = parseInt(document.getElementById('stories').value);
    const sealing = document.getElementById('sealing').checked;
    const stainRemoval = document.getElementById('stain_removal').checked;

    let basePrice = 0;
    if (surface === 'deck' || surface === 'driveway') {
        basePrice = 0.20; // $0.20 per square foot for decks and driveways
    } else if (surface === 'deck_fencing') {
        basePrice = 3.00; // $3.00 per linear foot for deck fencing
    } else if (surface === 'fencing') {
        basePrice = 0.20; // $0.20 per square foot for regular fencing
    } else if (surface === 'gutter') {
        basePrice = 0.85; // $0.85 per linear foot for gutter
    } else if (surface === 'shingle') {
        basePrice = 0.15; // $0.15 per square foot for shingle
    }

    let additionalCost = 0;
    if (sealing) {
        additionalCost += 0.05 * area; // $0.05 per square foot for sealing
    }
    if (stainRemoval) {
        additionalCost += 50; // $50 flat fee for stain removal
    }

    let totalCost = 0;
    if (surface === 'deck_fencing' || surface === 'gutter') {
        totalCost = basePrice * linearFeet;
    } else {
        totalCost = basePrice * area;
    }
    totalCost += additionalCost;
    totalCost *= stories; // Multiply the total cost by the number of stories

    const formattedQuote = `$${totalCost.toFixed(2)}`;
    document.getElementById('quote').textContent = `Estimated Quote: ${formattedQuote}`;
}