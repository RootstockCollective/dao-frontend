// Usage: http://localhost:3000/api/mocks/fetchPricesEndpoint?address=0x123&chainId=1
import { NextApiRequest, NextApiResponse } from 'next';

const addressToPrice: Record<string, number > = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { addresses, convert } = req.query;

    if (!addresses) {
        return res.status(400).json({
            error: "Missing required parameter 'addresses'",
        });
    }

    res.status(200).json({
        message: "Mock response for fetching prices",
        prices: {
            addresses: addresses.toString().split(',').map((address) => {
                const price = addressToPrice[address] || Math.random() * 1000;
                addressToPrice[address] = price;
                
                return {
                    address: {
                        "price": 0.07601445824978191,
                        "lastUpdated": "2024-08-12T11:51:00.000Z"
                    },
                    "0x0000000000000000000000000000000000000000": {
                        "price": 59709.08531329423,
                        "lastUpdated": "2024-08-12T11:50:00.000Z"
                    }
                };
            }),
            convert,
        },
    });
}
