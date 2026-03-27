import Link from "next/link";

type Plan = {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlight?: boolean;
};

const plans: Plan[] = [
    {
        name: "Starter",
        price: "₹0",
        description: "Perfect for individuals getting started",
        features: [
            "10 AI interviews / month",
            "Basic evaluation",
            "Email support",
        ],
    },
    {
        name: "Pro",
        price: "₹999/mo",
        description: "Best for growing teams",
        features: [
            "Unlimited interviews",
            "Advanced AI scoring",
            "Voice interviews",
            "Priority support",
        ],
        highlight: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large scale hiring",
        features: [
            "Custom workflows",
            "Dedicated support",
            "API access",
            "Analytics dashboard",
        ],
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#060e20] text-white px-6 py-20">

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-5xl font-bold mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-gray-400 text-lg">
                    Choose the plan that fits your hiring needs
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`rounded-2xl p-8 border backdrop-blur-xl transition hover:scale-[1.02]
            ${plan.highlight
                                ? "bg-gradient-to-b from-blue-500/20 to-purple-500/10 border-blue-400 shadow-[0_0_40px_rgba(71,196,255,0.2)]"
                                : "bg-[#0c1934]/80 border-[#1f2a44]"
                            }`}
                    >
                        {/* Plan Name */}
                        <h3 className="text-2xl font-semibold mb-2">
                            {plan.name}
                        </h3>

                        {/* Price */}
                        <div className="text-4xl font-bold mb-4">
                            {plan.price}
                        </div>

                        <p className="text-gray-400 mb-6">
                            {plan.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-300">
                                    ✔️ {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <Link
                            href="/admin"
                            className={`block text-center py-3 rounded-full font-semibold transition
              ${plan.highlight
                                    ? "bg-blue-400 text-black hover:brightness-110"
                                    : "border border-gray-600 hover:bg-white/5"
                                }`}
                        >
                            {plan.highlight ? "Get Started" : "Choose Plan"}
                        </Link>
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="text-center mt-20">
                <p className="text-gray-400 mb-4">
                    Need something custom?
                </p>
                <Link
                    href="/contact"
                    className="text-blue-400 hover:underline"
                >
                    Contact Sales →
                </Link>
            </div>
        </div>
    );
}