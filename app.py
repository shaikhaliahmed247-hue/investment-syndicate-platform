import os
import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0.1)

class PeerMetric(BaseModel):
    peer_name: str = Field(description="Name or ticker of the sector competitor")
    pe_ratio: str = Field(description="Trailing P/E ratio or valuation multiple")
    market_position: str = Field(description="Relative market share or competitive standing")

class ScoutAgentOutput(BaseModel):
    business_overview: str = Field(description="Detailed sector mapping and business model.")
    market_segment: str = Field(description="Primary operational industry.")

class QuantAgentOutput(BaseModel):
    valuation_multiples: str = Field(description="Valuation benchmarking including EV/EBITDA and P/E ratios.")
    dividend_profile: str = Field(description="Dividend yield stability.")
    live_metrics_summary: str = Field(description="Summary of live market capitalization, beta, and P/E.")
    peer_comparison: List[PeerMetric] = Field(description="Side-by-side comparison with 2-3 key industry competitors.")

class ConfidenceBreakdown(BaseModel):
    data_freshness: float
    financial_health: float
    market_sentiment: float

class RiskAgentOutput(BaseModel):
    risk_warning: str = Field(description="Rigorous institutional risk warning.")
    confidence_breakdown: ConfidenceBreakdown
    overall_confidence: float

class SyndicateOutput(BaseModel):
    asset_name: str
    scout_analysis: ScoutAgentOutput
    quant_analysis: QuantAgentOutput
    risk_analysis: RiskAgentOutput

structured_llm = llm.with_structured_output(SyndicateOutput)

class SyndicateState(TypedDict):
    target_asset: str
    market_data: dict
    report: SyndicateOutput

def fetch_market_guardrails(state: SyndicateState):
    asset = state["target_asset"]
    market_data = {"source": "Estimated Profile", "pe_ratio": "N/A", "market_cap": "N/A", "beta": "N/A"}
    try:
        ticker = yf.Ticker(asset)
        info = ticker.info
        if info and ("regularMarketPrice" in info or "currentPrice" in info or "marketCap" in info):
            market_data = {
                "source": "Yahoo Finance Live API",
                "pe_ratio": info.get("trailingPE", "N/A"),
                "market_cap": info.get("marketCap", "N/A"),
                "dividend_yield": info.get("dividendYield", "N/A"),
                "beta": info.get("beta", "N/A")
            }
    except Exception as e:
        print(f"⚠️ Quantitative guardrail fallback for {asset}: {e}")
    return {"market_data": market_data}

def syndicate_execution_node(state: SyndicateState):
    asset = state["target_asset"]
    guardrails = state["market_data"]
    prompt = (
        f"Perform an institutional-grade multi-agent analysis for target asset: {asset}. "
        f"Incorporate verified quantitative guardrails: {guardrails}. "
        "Generate specialized outputs for Scout, Quant (including a structured 3-peer comparison matrix), "
        "and Risk agents."
    )
    result = structured_llm.invoke(prompt)
    return {"report": result}

workflow = StateGraph(SyndicateState)
workflow.add_node("quant_guardrail", fetch_market_guardrails)
workflow.add_node("syndicate_analyst", syndicate_execution_node)

workflow.set_entry_point("quant_guardrail")
workflow.add_edge("quant_guardrail", "syndicate_analyst")
workflow.add_edge("syndicate_analyst", END)
syndicate_system = workflow.compile()

app = FastAPI(title="Investment Syndicate Enterprise API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class AssetRequest(BaseModel):
    asset_name: str

@app.post("/analyze")
def analyze_asset(request: AssetRequest):
    print(f"📡 Enterprise API request received for: {request.asset_name}")
    try:
        result = syndicate_system.invoke({"target_asset": request.asset_name})
        return result["report"].dict()
    except Exception as e:
        print(f"❌ Execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))