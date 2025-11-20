"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { Group } from "../../types/database";
import JoinGroupForm from "../../components/JoinGroupForm";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { useAuth } from "../../contexts/AuthContext";

interface GroupMember {
    user_id: string;
    role: string;
    status: string;
    joined_at: string;
}

export default function StudentGroupsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [groups, setGroups] = useState<(Group & { memberStatus: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchGroups();
    }, [refresh, user]);

    const fetchGroups = async () => {
        if (!user) return;

        setLoading(true);

        // Fetch groups where user is a member (active or pending)
        const { data, error } = await supabase
            .from("group_members")
            .select("group_id, groups(id, name, description, type, jumper_code), role, status")
            .eq("user_id", user.id);

        if (error || !data) {
            setGroups([]);
        } else {
            const groupsWithStatus = data
                .filter(gm => gm.groups) // Filter out null groups
                .map((gm: any) => ({
                    ...gm.groups,
                    role: gm.role,
                    memberStatus: gm.status
                }));
            setGroups(groupsWithStatus);
        }

        setLoading(false);
    };

    const handleGroupJoined = () => {
        setRefresh(r => r + 1);
    };

    const handleLeaveGroup = async (groupId: string, groupName: string) => {
        if (!user) return;

        if (!window.confirm(`Weet je zeker dat je "${groupName}" wilt verlaten?`)) {
            return;
        }

        const { error } = await supabase
            .from("group_members")
            .delete()
            .eq("group_id", groupId)
            .eq("user_id", user.id);

        if (!error) {
            setRefresh(r => r + 1);
        }
    };

    if (authLoading || loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!user) return null;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Mijn Klassen & Groepen
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Bekijk je klassen en groepen, of join een nieuwe groep met een jumper code.
                        </p>
                    </div>

                    {/* Join Group Form */}
                    <div className="mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Join een Groep
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Voer een jumper code in om lid te worden van een klas of community groep.
                            </p>
                            <JoinGroupForm onGroupJoined={handleGroupJoined} />
                        </div>
                    </div>

                    {/* Groups List */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Mijn Groepen
                        </h2>

                        {groups.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Je bent nog geen lid van enige groep. Gebruik een jumper code hierboven om te joinen!
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                    {group.name}
                                                </h3>

                                                {group.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                        {group.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-3 text-sm">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                        {group.type === 'klas' ? '🎓 Klas' : '👥 Community'}
                                                    </span>

                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full ${group.memberStatus === 'active'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                        }`}>
                                                        {group.memberStatus === 'active' ? '✓ Actief' : '⏳ Wacht op goedkeuring'}
                                                    </span>

                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono">
                                                        Code: {group.jumper_code}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="ml-4">
                                                <button
                                                    onClick={() => handleLeaveGroup(group.id, group.name)}
                                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    Verlaten
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
