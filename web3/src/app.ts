import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import SolanaService from "./services/SolanaService";

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
const solana = new SolanaService()

app.get<{}, MessageResponse>('/solana/create-wallet', (req, res) => {
    solana.createAccount()
        .then((account: any) => {
            res.json(account);
        })
});

app.post<{}, MessageResponse>('/solana/account-balance', (req, res) => {

    const {address} = req.body;
    solana.getBalanceFromAccountAddress(address)
        .then((balance: any) => {
            res.json({
                balance: balance
            } as any);

        })
});
app.post<{}, MessageResponse>('/solana/account-balance-usd', (req, res) => {

    const {address} = req.body;
    solana.getBalanceFromAccountAddress(address)
        .then((balance: any) => {
            solana.lamportsToUSD(balance)
                .then((usd: any) => {
                    res.json({
                        balance: usd
                    } as any);
                })

        })
});

app.post<{}, MessageResponse>('/solana/contract-info', (req, res) => {

    const {address} = req.body;
    solana.getContractInfoByAddress(address)
        .then((info: any) => {
            res.json(info as any);
        })
});

app.post<{}, MessageResponse>('/solana/send', (req, res) => {

    const {address, amount} = req.body;
    solana.transferCustomToken(address, amount)
        .then((info: any) => {
            res.json(info as any);
        }).catch((error: any) => {
        res.json(error as any);
    });
});


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
