// ------------------------------------------------------------------------
// Copyright 2026 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

namespace OrderProcessor;

/// <summary>
/// Payment request passed through the workflow hierarchy.
/// </summary>
/// <param name="CardLast4">Last four digits of the payment card.</param>
/// <param name="Amount">Amount to charge.</param>
/// <param name="Currency">ISO 4217 currency code.</param>
/// <param name="MerchantId">Merchant identifier.</param>
/// <param name="Description">Human-readable payment description.</param>
public sealed record PaymentRequest(
    string CardLast4,
    double Amount,
    string Currency,
    string MerchantId,
    string Description);

/// <summary>Result produced by the FraudDetection workflow.</summary>
/// <param name="RiskScore">Risk score in the range [0, 1].</param>
/// <param name="Approved">Whether the transaction was approved.</param>
/// <param name="Reason">Human-readable decision rationale.</param>
/// <param name="EventCount">Number of propagated history events inspected.</param>
public sealed record FraudCheckResult(
    double RiskScore,
    bool Approved,
    string Reason,
    int EventCount);

/// <summary>Result produced by the SettlePayment activity.</summary>
/// <param name="TransactionId">Unique transaction reference.</param>
/// <param name="Status">Settlement status string.</param>
/// <param name="EventCount">Number of propagated history events inspected.</param>
public sealed record SettlementResult(
    string TransactionId,
    string Status,
    int EventCount);
