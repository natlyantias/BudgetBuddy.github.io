/*
----------link.js
----------Sourced from Plaid's Tiny Quickstart Tutorial: https://github.com/plaid/tiny-quickstart
*/

(async ($) => {
    // Grab a Link token to initialize Link
    const createLinkToken = async () => {
      const res = await fetch("/api/create_link_token");
      const data = await res.json();
      const linkToken = data.link_token;
      localStorage.setItem("link_token", linkToken);
      return linkToken;
    };


    // Initialize Link
    const handler = Plaid.create({
      token: await createLinkToken(),
      onSuccess: async (publicToken, metadata) => {
        await fetch("/api/exchange_public_token", {
          method: "POST",
          body: JSON.stringify({ public_token: publicToken }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        await getBalance();
        await getTransactions();
        // TODO: refresh the page once plaid account is connected
      },
      onEvent: (eventName, metadata) => {
        console.log("Event:", eventName);
        console.log("Metadata:", metadata);
      },
      onExit: (error, metadata) => {
        console.log(error, metadata);
      },
    });

    // Start Link when button is clicked
    const linkAccountButton = document.getElementById("link-account");
    linkAccountButton.addEventListener("click", (event) => {
      handler.open();
    });
  })(jQuery);

  // Retrieves balance information
  const getBalance = async function () {
    const response = await fetch("/api/data", {
      method: "GET",
    });
  };

  const getTransactions = async function() {
    const response = await fetch("/api/transactions", {
      method: "GET",
    });

  };

  // Check whether account is connected
  const getStatus = async function () {
    const account = await fetch("/api/is_account_connected");
    const connected = await account.json();

    if (connected.status == true) {
      getBalance();
      // getTransactions();
    }
  };

  getStatus();