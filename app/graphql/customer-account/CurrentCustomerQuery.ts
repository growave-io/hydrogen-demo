// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
export const CURRENT_CUSTOMER_QUERY = `#graphql
  query CurrentCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
` as const;
