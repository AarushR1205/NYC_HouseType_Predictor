// ============================================================
// CONFIG
// ============================================================

const API_BASE_URL = "https://nyc-housetype-predictor-1.onrender.com";

const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

const REDUCE_MOTION =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================================
// ROOM TYPE CLASSES
// ============================================================

const ROOM_CLASSES = [
    {
        key: "Entire home/apt",
        label: "Entire home/apt",
        rows: 6,
        cols: 2,
        height: "100%"
    },
    {
        key: "Private room",
        label: "Private room",
        rows: 4,
        cols: 2,
        height: "68%"
    },
    {
        key: "Shared room",
        label: "Shared room",
        rows: 2,
        cols: 2,
        height: "42%"
    }
];

// ============================================================
// EXAMPLE LISTINGS
// ============================================================

const EXAMPLES = [
    {
        latitude: 40.7484,
        longitude: -73.9857,
        price: 120,
        minimum_nights: 2,
        number_of_reviews: 84,
        reviews_per_month: 2.3,
        calculated_host_listings_count: 1,
        availability_365: 210,
        neighbourhood_group: "Manhattan",
        neighbourhood: "Midtown"
    },
    {
        latitude: 40.6782,
        longitude: -73.9442,
        price: 55,
        minimum_nights: 1,
        number_of_reviews: 210,
        reviews_per_month: 4.1,
        calculated_host_listings_count: 3,
        availability_365: 300,
        neighbourhood_group: "Brooklyn",
        neighbourhood: "Bedford-Stuyvesant"
    },
    {
        latitude: 40.7282,
        longitude: -73.7949,
        price: 38,
        minimum_nights: 3,
        number_of_reviews: 12,
        reviews_per_month: 0.6,
        calculated_host_listings_count: 1,
        availability_365: 90,
        neighbourhood_group: "Queens",
        neighbourhood: "Flushing"
    }
];

let exampleIndex = 0;

// ============================================================
// AMBIENT SKYLINE WINDOW TWINKLE
// ============================================================

function buildSkylineLights() {
    const container = document.getElementById("skylineBg");

    if (!container || REDUCE_MOTION) {
        return;
    }

    const count = 42;

    for (let i = 0; i < count; i++) {
        const light = document.createElement("div");

        light.className = "window-light";

        const size = Math.random() < 0.5 ? 2 : 3;

        light.style.width = `${size}px`;
        light.style.height = `${size}px`;
        light.style.left = `${Math.random() * 100}%`;
        light.style.bottom = `${8 + Math.random() * 32}vh`;
        light.style.animationDelay = `${Math.random() * 5}s`;
        light.style.animationDuration = `${3.5 + Math.random() * 3}s`;

        container.appendChild(light);
    }
}

// ============================================================
// FORM ELEMENTS
// ============================================================

const form = document.getElementById("predictForm");
const predictBtn = document.getElementById("predictBtn");
const formError = document.getElementById("formError");
const availabilityInput = document.getElementById("availability_365");
const availabilityValue = document.getElementById("availabilityValue");
const exampleBtn = document.getElementById("exampleBtn");

// ============================================================
// AVAILABILITY SLIDER
// ============================================================

if (availabilityInput && availabilityValue) {
    availabilityInput.addEventListener("input", () => {
        availabilityValue.textContent = availabilityInput.value;
    });
}

// ============================================================
// EXAMPLE BUTTON
// ============================================================

if (exampleBtn) {
    exampleBtn.addEventListener("click", () => {
        const data = EXAMPLES[exampleIndex % EXAMPLES.length];

        exampleIndex++;

        Object.entries(data).forEach(([key, value]) => {
            const element = form.elements[key];

            if (element) {
                element.value = value;
            }
        });

        if (availabilityValue) {
            availabilityValue.textContent = data.availability_365;
        }

        if (formError) {
            formError.textContent = "";
        }
    });
}

// ============================================================
// FORM SUBMISSION
// ============================================================

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        formError.textContent = "";

        if (!form.reportValidity()) {
            return;
        }

        const payload = collectPayload();

        console.log("Sending payload:", payload);

        setLoading(true);

        try {
            const res = await fetch(PREDICT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            // ------------------------------------------------
            // Read response as text first.
            // This prevents:
            // "Unexpected end of JSON input"
            // ------------------------------------------------

            const responseText = await res.text();

            console.log("API response status:", res.status);
            console.log("API raw response:", responseText);

            // ------------------------------------------------
            // Handle HTTP errors
            // ------------------------------------------------

            if (!res.ok) {
                let errorMessage = `Request failed (${res.status}).`;

                if (responseText.trim()) {
                    try {
                        const errorData = JSON.parse(responseText);

                        if (errorData.detail) {
                            errorMessage = formatDetail(errorData.detail);
                        }
                    } catch {
                        errorMessage = responseText;
                    }
                }

                throw new Error(errorMessage);
            }

            // ------------------------------------------------
            // Handle empty response
            // ------------------------------------------------

            if (!responseText.trim()) {
                throw new Error(
                    "The backend returned an empty response."
                );
            }

            // ------------------------------------------------
            // Parse JSON safely
            // ------------------------------------------------

            let result;

            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error(
                    "Invalid JSON from backend:",
                    jsonError
                );

                throw new Error(
                    "The backend returned invalid JSON."
                );
            }

            console.log("Parsed prediction:", result);

            // ------------------------------------------------
            // Render result
            // ------------------------------------------------

            renderResult(result);
        } catch (err) {
            console.error("Prediction error:", err);

            const message = err?.message || "";

            if (
                message.includes("Failed to fetch") ||
                message.includes("NetworkError") ||
                message.includes("fetch")
            ) {
                formError.textContent =
                    "Can't reach the prediction API. " +
                    "Please check that the FastAPI backend is running.";
            } else {
                formError.textContent =
                    message ||
                    "Something went wrong. Please try again.";
            }
        } finally {
            setLoading(false);
        }
    });
}

// ============================================================
// COLLECT FORM DATA
// ============================================================

function collectPayload() {
    const fd = new FormData(form);

    return {
        latitude: parseFloat(fd.get("latitude")),
        longitude: parseFloat(fd.get("longitude")),
        price: parseFloat(fd.get("price")),
        minimum_nights: parseInt(
            fd.get("minimum_nights"),
            10
        ),
        number_of_reviews: parseInt(
            fd.get("number_of_reviews"),
            10
        ),
        reviews_per_month: parseFloat(
            fd.get("reviews_per_month")
        ),
        calculated_host_listings_count: parseInt(
            fd.get("calculated_host_listings_count"),
            10
        ),
        availability_365: parseInt(
            fd.get("availability_365"),
            10
        ),
        neighbourhood_group: fd.get("neighbourhood_group"),
        neighbourhood: fd.get("neighbourhood")
    };
}

// ============================================================
// FORMAT FASTAPI VALIDATION ERRORS
// ============================================================

function formatDetail(detail) {
    if (Array.isArray(detail)) {
        return detail
            .map((d) => {
                if (d.msg) {
                    return d.msg;
                }

                return JSON.stringify(d);
            })
            .join(" ");
    }

    return String(detail);
}

// ============================================================
// LOADING STATE
// ============================================================

function setLoading(isLoading) {
    if (!predictBtn) {
        return;
    }

    predictBtn.disabled = isLoading;

    predictBtn.classList.toggle(
        "loading",
        isLoading
    );
}

// ============================================================
// RESULT ELEMENTS
// ============================================================

const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const predictedName = document.getElementById("predictedName");
const buildingsRow = document.getElementById("buildingsRow");
const probList = document.getElementById("probList");

// ============================================================
// RENDER RESULT
// ============================================================

function renderResult(result) {
    console.log("Rendering result:", result);

    // --------------------------------------------------------
    // Validate response
    // --------------------------------------------------------

    if (!result) {
        throw new Error(
            "No result was returned by the backend."
        );
    }

    const predicted = result.Predicted_room_type;
    const probs = result.Probability;

    if (!predicted) {
        throw new Error(
            "Backend response is missing Predicted_room_type."
        );
    }

    if (!Array.isArray(probs)) {
        throw new Error(
            "Backend response is missing Probability."
        );
    }

    // --------------------------------------------------------
    // Pair classes with probabilities
    // --------------------------------------------------------

    const paired = ROOM_CLASSES.map((cls, i) => ({
        ...cls,
        prob:
            typeof probs[i] === "number"
                ? probs[i]
                : 0
    }));

    // --------------------------------------------------------
    // Show result
    // --------------------------------------------------------

    if (resultEmpty) {
        resultEmpty.hidden = true;
    }

    if (resultContent) {
        resultContent.hidden = false;
    }

    if (predictedName) {
        predictedName.textContent = predicted;
    }

    buildBuildings(paired, predicted);
    buildProbList(paired, predicted);
}

// ============================================================
// BUILD VISUAL BUILDINGS
// ============================================================

function buildBuildings(paired, predicted) {
    if (!buildingsRow) {
        return;
    }

    buildingsRow.innerHTML = "";

    paired.forEach((cls) => {
        const col = document.createElement("div");

        col.className = "building-col";

        const b = document.createElement("div");

        b.className = "building";

        b.style.setProperty("--h", "18%");

        const totalWindows = cls.rows * cls.cols;

        const litCount = Math.round(
            totalWindows * cls.prob
        );

        // ----------------------------------------------------
        // Create windows
        // ----------------------------------------------------

        for (let i = 0; i < totalWindows; i++) {
            const win = document.createElement("div");

            win.className = "win";

            b.appendChild(win);
        }

        // ----------------------------------------------------
        // Caption
        // ----------------------------------------------------

        const caption = document.createElement("div");

        caption.className = "building-caption";
        caption.textContent = cls.label;

        col.appendChild(b);
        col.appendChild(caption);

        buildingsRow.appendChild(col);

        // ----------------------------------------------------
        // Animate
        // ----------------------------------------------------

        requestAnimationFrame(() => {
            setTimeout(() => {
                b.style.setProperty("--h", cls.height);

                const wins = b.querySelectorAll(".win");

                wins.forEach((w, i) => {
                    if (i < litCount) {
                        setTimeout(
                            () => {
                                w.classList.add("lit");
                            },
                            REDUCE_MOTION
                                ? 0
                                : 60 * i + 300
                        );
                    }
                });

                if (cls.key === predicted) {
                    b.style.boxShadow =
                        "0 0 22px -4px var(--amber-glow)";
                }
            }, REDUCE_MOTION ? 0 : 80);
        });
    });
}

// ============================================================
// BUILD PROBABILITY LIST
// ============================================================

function buildProbList(paired, predicted) {
    if (!probList) {
        return;
    }

    probList.innerHTML = "";

    const sorted = [...paired].sort(
        (a, b) => b.prob - a.prob
    );

    sorted.forEach((cls) => {
        const row = document.createElement("div");

        row.className =
            "prob-row" +
            (cls.key === predicted ? " top" : "");

        const name = document.createElement("span");

        name.className = "name";
        name.textContent = cls.label;

        const value = document.createElement("span");

        value.className = "value";
        value.textContent = "0%";

        const track = document.createElement("div");

        track.className = "prob-track";

        const fill = document.createElement("div");

        fill.className = "prob-fill";

        track.appendChild(fill);

        row.appendChild(name);
        row.appendChild(value);
        row.appendChild(track);

        probList.appendChild(row);

        const pct = Math.round(cls.prob * 100);

        requestAnimationFrame(() => {
            setTimeout(() => {
                fill.style.width = `${pct}%`;

                animateCount(value, pct);
            }, REDUCE_MOTION ? 0 : 150);
        });
    });
}

// ============================================================
// ANIMATE PERCENTAGE
// ============================================================

function animateCount(el, target) {
    if (REDUCE_MOTION) {
        el.textContent = `${target}%`;
        return;
    }

    const duration = 700;
    const start = performance.now();

    function tick(now) {
        const t = Math.min(
            1,
            (now - start) / duration
        );

        const eased =
            1 - Math.pow(1 - t, 3);

        el.textContent =
            `${Math.round(target * eased)}%`;

        if (t < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

// ============================================================
// API HEALTH CHECK
// ============================================================

async function checkApiStatus() {
    const statusEl = document.getElementById("apiStatus");

    if (!statusEl) {
        return;
    }

    try {
        const res = await fetch(HEALTH_ENDPOINT, {
            method: "GET"
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const text = await res.text();

        if (!text.trim()) {
            throw new Error("Empty health response");
        }

        const data = JSON.parse(text);

        if (data.status !== "healthy") {
            throw new Error("API is not healthy");
        }

        statusEl.classList.add("online");
        statusEl.classList.remove("offline");

        if (statusEl.lastChild) {
            statusEl.lastChild.textContent = "API connected";
        }
    } catch (error) {
        console.error(
            "API health check failed:",
            error
        );

        statusEl.classList.add("offline");
        statusEl.classList.remove("online");

        if (statusEl.lastChild) {
            statusEl.lastChild.textContent = "API unreachable";
        }
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        buildSkylineLights();
        checkApiStatus();
    }
);
